import 'dotenv/config';
import Fs from 'fs';
import Path from 'path';
import Util from 'util';
import Puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import cors from 'cors';
import moment from 'moment';
import express from 'express';

const ReadFile = Util.promisify(Fs.readFile);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/pdf', async (req, res) => {
  const handleParseContent = contentBody => {
    const contentNode = [];
    const contents = contentBody.split('#');

    for (let i = 0; i < contents.length; i += 1) {
      const content = [];
      const splited = contents[i].split('*');

      for (let j = 0; j < splited.length; j += 1) {
        if (j % 2 === 0) content.push(`<span> ${splited[j]} </span>`);
        else content.push(`<strong> ${splited[j]}</strong>`);
      }

      contentNode.push(`
        <h3>${content.join(`
        `)}</h3>
      `);
    }

    return contentNode.join(`
    `);
  };

  const analystNote = req.body;
  const { isDarkMode } = req.params;

  analystNote.issuedDate = analystNote.date ? `${moment(analystNote.date).format('DD MMM YYYY')} ᐧ ` : '';
  analystNote.author = analystNote.author ? `${analystNote.author} ᐧ ` : '';
  analystNote.team_tags = analystNote.team_tags[0] ? analystNote.team_tags : [];
  analystNote.hiq_tags = analystNote.hiq_tags[0] ? analystNote.hiq_tags : [];

  try {
    const content = await ReadFile('template.html', 'utf8');
    console.log(content);
    const template = Handlebars.compile(content);
    const html = await template(analystNote);

    const templateArr = html.split('</p>');

    const cTemplate = `
      ${templateArr[0]}
      </p>
      <div class="tags">
        ${analystNote.team_tags.map(tag => `<span class="tag">${tag}</span>`).join(``)}
        ${analystNote.hiq_tags.map(tag => `<span class="tag">${tag}</span>`).join(``)}
      </div>
      <br/>
      <article style="text-align: left;">${handleParseContent(analystNote.body)}</article>
      ${templateArr[1]}
    `;

    const browser = await Puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(cTemplate);
    await page.emulateMedia('screen');
    await page
      .pdf({
        path: './output.pdf',
        format: 'A4',
        margin: {
          top: '50px',
          bottom: '50px',
        },
      })
      .then(pdfRes => {
        res.set({ 'Content-Type': 'application/pdf', 'Content-length': pdfRes.length });
        res.send(pdfRes);
      })
      .catch(console.error);
    await browser.close();
  } catch (error) {
    throw new Error('Cannot create HTML template');
  }
});

app.listen(process.env.PORT, () => {
  console.log('HIERA PDF API on port 5101');
});
