import fs from 'node:fs';

const apiKey = process.env.LINEAR_API_KEY;
const teamKey = process.env.LINEAR_TEAM_KEY;
const dryRun = process.argv.includes('--apply') ? false : true;

if (!apiKey) {
  console.error('Missing LINEAR_API_KEY.');
  process.exit(1);
}
if (!teamKey) {
  console.error('Missing LINEAR_TEAM_KEY (ex: ENG).');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync('linear/phased_tasks.json', 'utf8'));
const endpoint = 'https://api.linear.app/graphql';

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data;
}

async function getTeamId() {
  const data = await gql(`query($key: String!) { teams(filter: { key: { eq: $key }}) { nodes { id key name } } }`, { key: teamKey });
  const team = data.teams.nodes[0];
  if (!team) throw new Error(`Team not found for key ${teamKey}`);
  return team.id;
}

async function getProjectIdByName(teamId, name) {
  const data = await gql(
    `query($name: String!) { projects(filter: { name: { eq: $name }}) { nodes { id name teams { nodes { id key name } } } } }`,
    { name }
  );
  const projects = data.projects.nodes || [];
  const p = projects.find((project) =>
    (project.teams?.nodes || []).some((team) => team.id === teamId)
  );
  if (!p) {
    throw new Error(`Project not found for team (${teamId}) with name: ${name}`);
  }
  return p.id;
}

async function ensureLabel(teamId, name) {
  const existing = await gql(`query($teamId: ID!, $name: String!) { issueLabels(filter: { team: { id: { eq: $teamId }}, name: { eq: $name }}) { nodes { id name } } }`, { teamId, name });
  if (existing.issueLabels.nodes[0]) return existing.issueLabels.nodes[0].id;
  const created = await gql(`mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { success issueLabel { id name } } }`, {
    input: { teamId, name }
  });
  return created.issueLabelCreate.issueLabel.id;
}

async function createIssue(input) {
  const data = await gql(`mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier title url } } }`, { input });
  return data.issueCreate.issue;
}

async function run() {
  const teamId = await getTeamId();
  const projectId = await getProjectIdByName(teamId, payload.projectName);

  let created = 0;
  for (const phase of payload.phases) {
    const phaseLabelId = await ensureLabel(teamId, phase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50));

    for (const task of phase.tasks) {
      const taskLabelIds = [phaseLabelId];
      for (const label of task.labels || []) {
        const id = await ensureLabel(teamId, label);
        taskLabelIds.push(id);
      }

      const issueInput = {
        teamId,
        projectId,
        title: task.title,
        description: `## Fase\n${phase.name}\n\n## Descrição\n${task.description}`,
        priority: task.priority,
        estimate: task.estimate,
        labelIds: [...new Set(taskLabelIds)]
      };

      if (dryRun) {
        console.log('[dry-run] issueCreate', issueInput.title);
      } else {
        const issue = await createIssue(issueInput);
        console.log(`[created] ${issue.identifier} ${issue.title} -> ${issue.url}`);
      }
      created++;
    }
  }

  console.log(`${dryRun ? 'Prepared' : 'Created'} ${created} tasks.`);
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
