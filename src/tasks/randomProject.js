import api, { route } from "@forge/api";

/**
 * Example task that logs a random Jira project.
 */
export default async function randomProject() {
  const response = await api.asApp().requestJira(route`/rest/api/3/project/search`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const body = await response.json();
  if (body.values.length === 0) {
    console.log("No Jira projects found");
  } else {
    const randomProject = body.values[Math.floor(Math.random() * body.values.length)];
    console.log(`Your random Jira project is: ${randomProject.name}`);
  }
}
