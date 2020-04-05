import 'dotenv/config';
import Fs from 'fs';
import Path from 'path';
import Util from 'util';
import Puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import cors from 'cors';
import moment from 'moment';
import express from 'express';
import merge from 'easy-pdf-merge';

const ReadFile = Util.promisify(Fs.readFile);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

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

  analystNote.issuedDate = analystNote.date ? `${moment(analystNote.date).format('MM DD, YYYY')} ᐧ ` : '';
  analystNote.author = analystNote.author ? `${analystNote.author} ᐧ ` : '';
  analystNote.team_tags = analystNote.team_tags[0] ? analystNote.team_tags : [];
  analystNote.hiq_tags = analystNote.hiq_tags[0] ? analystNote.hiq_tags : [];
  analystNote.body = `${handleParseContent(analystNote.body)}`;
  
  //console.log(analystNote.body);
  try {
    const content = await ReadFile('template.html', 'utf8');
    const template = Handlebars.compile(content);
    const html = await template(analystNote);
    console.log(html);
    /*const templateArr = html.split('<article');

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
    `;*/

    const browser = await Puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();

    await page.setContent(content);
    await page.waitFor(300);
    await page.emulateMedia('print');
    
    let pdf_options = {
        path: './public/cover.pdf',
        format: 'Letter',
        width: '8.50in',
        height: '11.00in',
        margin: {
          top: '30mm',
          right: '20mm',
          bottom: '30mm',
          left: '20mm',
        },
        printBackground: true,
        displayHeaderFooter: false,
        headerTemplate: `|-
          <style>
            section {
              margin: 0 auto;
              font-family: system-ui;
              font-size: 11px;
            }
          </style>
          <section>
              <!--span class='date'></span-->
          </section>`,
        footerTemplate: `|-
          <section class='footer'>
               www.holoniq.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               &nbsp;&nbsp;&nbsp;&nbsp;
               <span class="pageNumber"></span>
          </section>
          <style>
            .footer:first-of-type {
              color: red;
            }
            .footer:first-child {
              color: blue;
            }
            body .footer:first-of-type {
              color: green;
              background: yellow;
            }
            body > .footer:first-child {
              color: yellow;
              background: black;
            }
            body > .footer:first-of-type {
              color: brown;
              background: black;
            }
            @page:first .footer:first-of-type {
              color: gold;
              background: yellow;
            }
            
            @page:first .footer {
              color: red;
              background: yellow;
            }
          </style>`,
        pageRanges: '1',
      };
    /*await page
      .pdf(pdf_options)
      .then(pdfRes => {
        console.log(pdfRes.length);
        //res.set({ 'Content-Type': 'application/pdf', 'Content-length': pdfRes.length });
        //res.send(pdfRes);
        res.send({ 'Content-Type': 'application/pdf', 'pdf-length': pdfRes.length });
      })
      .catch(error => {
        console.error(error)
        return res.send(error)
      });*/
    
    const firstPage = await page.pdf(pdf_options);
    pdf_options.path = './public/body.pdf';
    pdf_options.displayHeaderFooter = true;
    pdf_options.pageRanges = '2-';
    const restPages = await page.pdf(pdf_options);
    const totalLength = firstPage.length + restPages.length;
    merge(['public/cover.pdf', 'public/body.pdf'], 'public/output.pdf',
      function(err){
        if(err) {
            return console.log(err)
        }
        console.log('Successfully merged!')
        res.send({'Content-Type': 'application/pdf', 'pdf-length': totalLength});
      });
    
    await browser.close();
  } catch (error) {
    throw new Error('Cannot create HTML template');
  }
});

app.listen(process.env.PORT, () => {
  console.log('HIERA PDF API listening on port: 5101');
});
