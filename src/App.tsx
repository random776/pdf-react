import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // Make sure to import pdfjs
import secondPDF from "/chibutsu_nyumon.pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import parse from "html-react-parser";
import { createWorker } from "tesseract.js";

// Set the worker source path for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function App() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [string, setString] = useState("");
  const [ocr, setOcr] = useState("");
  const options = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    []
  );

  // render the first page of the pdf file using `PageNumber` property of `Page` when loaded pdf file.
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  // move the page that is rendered.
  const goToPrevPage = (): void => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = (): void => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // try to extract strings from pdf file
  async function extractTextFromPDF(pdfUrl: any, options: any) {
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent(options);
      console.log(textContent.items);
      let text = "";
      for (let textItem of textContent.items) {
        if ("str" in textItem) {
          text += textItem?.str + "\n";
        }
      }
      fullText += text + "\n";
    }

    return fullText;
  }

  // extract strings from `photo.jpg` in `public` using `tesseract.js`
  async function ocrText(path: string) {
    const worker = await createWorker("jpn");
    const ret = await worker.recognize(path);
    await worker.terminate();
    const strippedText = ret.data.text.replace(/ /g, "");
    console.log(strippedText);
    return strippedText;
  }

  // usage of extractTextFromPDF
  const pdfUrl = secondPDF;

  extractTextFromPDF(pdfUrl, options)
    .then((text) => {
      setString(text);
    })
    .catch((error) => {
      console.error("Error extracting text from PDF:", error);
    });

  const renderedText = string; //.replace(/\n/g, "<br>");

  // usage of ocrText

  const path = "/photo.jpg";

  ocrText(path)
    .then((text) => {
      setOcr(text);
    })
    .catch((error) => {
      console.error("Error OCR:", error);
    });

  const renderedOCR = ocr.replace(/\n/g, "<br>");

  return (
    <div>
      <div className="blocka">
        <h2>PDFファイルから文字情報を抜き出す方法の検討</h2>
        <h3>つかったもの</h3>
        <ul>
          <li>
            <a href="https://react-pdf.org">react-pdf</a>
          </li>
          <p>reactむけのPDF.jsのようなものらしい。</p>
          <li>
            <a href="https://tesseract.projectnaptha.com">tesseract.js</a>
          </li>
        </ul>
        <h3>React-pdfを用いてPDFファイルを表示する。</h3>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <button disabled={pageNumber <= 1} onClick={goToPrevPage}>
          Prev
        </button>
        <button disabled={pageNumber >= numPages} onClick={goToNextPage}>
          Next
        </button>

        <Document
          file={secondPDF}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="blockb">
        <h3>方法論その1: react-pdfを用いて文字情報をそのまま持ってくる。</h3>
        <p>
          日本語ファイルがうまく表示されないことがあって苦戦（うまくいくこともある）。
        </p>
        <hr />
        <p>{parse(renderedText)}</p>
        <hr />
        <h3>
          方法論その2:
          tesseract.jsなどを用いてOCRによって写真から文字を読み取る。
        </h3>
        <p>
          これはPDFそのものから持ってきたものではなく、PDFのスクリーンショットを読み込ませている。
        </p>
        <p>
          スクリーンショットなど画像ファイルから文字を読み取る仕様ならこれでも良い。
        </p>
        <p>
          PDFファイルから読み取るなら、PDFを写真として読み取る方法が文字起こしには必要。
        </p>
        <hr />
        <p>{parse(renderedOCR)}</p>
        <hr />
      </div>
    </div>
  );
}
