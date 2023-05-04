const fs = require("fs");
const axios = require("axios").default;
const HTMLParser = require("node-html-parser");

const fetchProjects = async () => {
  const api = await axios.get("https://fossunited.org/fosshack/2023/projects");
  const html = HTMLParser.parse(api.data);
  const data = await Promise.all(
    html.querySelectorAll(".list-group-item").map(async (e) => {
      const titleHtml = e.querySelector(".row");
      const url =
        "https://fossunited.org" +
        titleHtml.querySelector("a").getAttribute("href");
      const title = titleHtml
        .querySelector(".d-inline-block")
        ?.innerText.replace("📺️", "")
        .trim();

      const projectHtml = HTMLParser.parse((await axios.get(url)).data);
      const members = projectHtml
        .querySelectorAll("#members .list-group-item")
        .map((m) => {
          const name = m.innerText.trim();
          return { name };
        });

      return { url, title, members };
    })
  );

  const csv = [["title", "url", "members"]];

  data.forEach((e) => {
    const members = e.members.map((m) => m.name).join(", ");
    csv.push([e.title, e.url, members]);
  });

  fs.writeFileSync("./out/data.json", JSON.stringify(data, null, 4));
  fs.writeFileSync("./out/data.csv", csv.map((e) => e.join(",")).join("\n"));
};

fetchProjects();
