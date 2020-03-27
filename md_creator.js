const mdToPdf = require('md-to-pdf');
const fs = require("fs");

var pdf_content = `
## $13B in gains and $11B in losses for January. 

#### Capital Markets - February 2020. 

#### Chinese education stocks, powered for the most part by digital solutions, are the strong performers amidst COVID-19 concerns. Publishers & student accommodation providers are taking hits.

#### Chinese stocks dominating the top performers.

#### Chinese education stocks are, for the most part focused on technology enhanced delivery, so it's perhaps not surprising that amid the COVID-19 outbreak in China as schools and universities are being closed, that stocks are fairing well. Outside China, IDP (Australia) and 2U (USA), were also among the top performing education stocks this month.

#### Publishing companies continue a horror run

#### Publishing stocks continue see declining market caps with Informa, Wiley and Pearson again in the bottom performers for the month. In the UK, Informa closed 15% down (10% down last month) & Pearson 6% down (12% down last month) while US publisher, Wiley, closed 15% down (10% down last month).

#### UK-based student accommodation provider Unite posted a 14% decline in market cap for the month, likely to be a result of restricted travel for international students and university closures resulting from COVID-19.

#### Cornerstone on Demand to acquire Saba 

#### The enterprise LMS giant, Cornerstone on Demand announced the acquisition of competitor, Saba, this month in a transaction worth $1.4 billion bringing Cornerstone an additional 1,000+ enterprise-class customers.

#### Digital credentialing acquisitions

#### This month saw two acquisitions in the digital credentialing space with Parchment, a digital credential service acquired by PE firm Brentwood Associates and Learning Machine, which issues digital credentials based on blockchain technology was acquired by general technology services company Hyland.
`;

const content_option = {
    // "stylesheet": [
    //   "css/style.css"
    // //  "https://example.org/stylesheet.css"
    // ],
    // "css": "body { color: tomato; }",
    // "body_class": "markdown-body",
    // "highlight_style": "monokai",
    // "marked_options": {
    //   "headerIds": false,
    //   "smartypants": true,
    // },
    "dest": 'pdf/output.pdf',
    "pdf_options": {
        "format": "Letter",
        "margin": "10mm 20mm",
        "printBackground": true,
        "displayHeaderFooter": true,
        },
    "stylesheet_encoding": "utf-8"
  };

async function title(){
    // const pdf = await mdToPdf('docs/' + config.title, content_option).catch(console.error);
    const pdf = await mdToPdf({ content: pdf_content }, content_option);
    if (pdf) {
        console.log(pdf.filename);
    }
};
title();