import api, { route } from "@forge/api";

export default async function randomProject() {
  const response = await api.asApp().requestJira(route`/rest/api/3/project/search`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const body = await response.json();
  const randomProject = body.values[Math.floor(Math.random() * body.values.length)];
  console.log(`Your random Jira project is: ${randomProject.name}`);
}
