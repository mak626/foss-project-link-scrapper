const fs = require("fs");
const axios = require("axios").default;
const HTMLParser = require("node-html-parser");

const fetchProjects = async () => {
  const api = await axios.get("https://fossunited.org/fosshack/2023/projects");
  const html = HTMLParser.parse(api.data);

  const data = html
    .querySelectorAll(".list-group-item")
    .map((e) => {
      const titleHtml = e.querySelector(".row");
      const url =
        "https://fossunited.org" +
        titleHtml.querySelector("a").getAttribute("href");
      const title = titleHtml
        .querySelector(".d-inline-block")
        ?.innerText.replace("📺️", "")
        .trim();
      const likes = Number.parseInt(
        titleHtml
          .querySelector("span.badge")
          ?.innerText.replace("❤️️️️", "")
          .trim()
      );
      const description = e.querySelector("p")?.innerText;

      return { url, title, description, likes };
    })
    .sort((a, b) => b.likes - a.likes);

  const csv = [["title", "url", "description", "likes"]];

  data.forEach((e) => {
    csv.push([e.title, e.url, JSON.stringify(e.description), e.likes]);
  });

  fs.writeFileSync("./out/data.json", JSON.stringify(data, null, 4));
  fs.writeFileSync("./out/data.csv", csv.map((e) => e.join(",")).join("\n"));
};

fetchProjects();
