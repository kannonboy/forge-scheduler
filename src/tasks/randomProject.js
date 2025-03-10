import api, { route } from "@forge/api";

export default async function randomProject() {
  const response = await api.asUser().requestJira(route`/rest/api/3/project/search`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const randomProject = response.body.values[Math.floor(Math.random() * response.body.values.length)];
  console.log(`Here's a random Jira project: ${randomProject.name}`);
}
