import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // Make sure to import pdfjs
import secondPDF from "/chibutsu_nyumon.pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set the worker source path for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function App() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [result, setResult] = useState<string[]>([]); // 新しいStateを定義
  const resultList: string[] = []; // pdfから抜き取った情報を、ここから抜いていく。

  const options = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    []
  );

  // ページ移動
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

  // pdfから文字を抜き出す非同期関数
  async function extractTextFromPDF(pdf: {
    getPage: (arg0: any) => any;
    numPages: any;
  }) {
    const getPageText = async (pageNum: number) => {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const renderedTextContent = textContent.items
        .map((item: { str: any }) => item.str)
        .join("");
      resultList.push(renderedTextContent);
      setResult(resultList);
      console.log(result);
    };

    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      await getPageText(i);
    }
  }

  async function onDocumentLoadSuccess(pdf: { numPages: any; getPage: any }) {
    const numPages = pdf.numPages;
    setNumPages(numPages); // Extract text from PDF
    await extractTextFromPDF(pdf);
  }

  return (
    <div>
      <div className="blocka">
        <h2>PDFファイルから文字情報を抜き出す方法の検討</h2>
        <h3>つかったもの</h3>
        <ul>
          <li>
            <a href="https://react-pdf.org">react-pdf</a>
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
        <h3>方法: react-pdfを用いて文字情報をそのまま持ってくる。</h3>
        <p>
          日本語ファイルがうまく表示されないことがあって苦戦したが、うまくいった。
        </p>
        <hr />
        <p>{result[pageNumber - 1]}</p>
        <hr />
      </div>
    </div>
  );
}