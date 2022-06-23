<script lang="ts">
  import { getOption, getMerchantKey, getOrderId } from 'razorpay';
  //store
  import { phone, email } from 'checkoutstore/screens/home';

  // svelte imports
  import { onMount } from 'svelte';
  // utils
  import { getSession } from 'sessionmanager';

  import {
    labels,
    rzpLogo,
    hdfcLogo,
    rupeeDataUrl,
    csdKey,
    csdDisclaimer,
  } from './challanConstants';
  import {
    isCustomChallan,
    getCustomFields,
    getCustomDisclaimers,
  } from './helper';
  import { getCheckoutBridge, getNewIosBridge } from 'bridge';
  import { getSDKMeta } from 'checkoutstore/native';

  const {
    HEADER,
    ROW_HEADERS,
    OFFICE_USE,
    HDFC_DISCLAIMERS,
    NON_HDFC_DISCLAIMERS,
    DISCLAIMER_LABEL,
    DIPOSITOR_SIGN_LABEL,
    AUTH_SIGN_LABEL,
    BRANCH_LABEL,
  } = labels;

  let neftView;
  export let neftDetails;
  export let expiry;
  export let amount;
  const description = getOption('description');
  let merchant_logo = getOption('image');
  const orderId = getOrderId();
  let merchantLogoUrl;
  let orgLogoUrl;
  let isHDFC = false;
  let disclaimers = NON_HDFC_DISCLAIMERS;
  let orgName = 'Razorpay';
  const pdfStartX = 10;
  const pdfEndX = 200;
  const pdfColumnHeight = 8;
  const pdfTextPaddingTop = 5;
  const pdfTextBaddingBottom = 3;
  const pdfColumnSepX = 70;
  let top = 40;
  let doc;
  const key = getMerchantKey();

  const name = getOption('prefill.name');

  const { account_number, ifsc, branch, bank_name } = neftDetails;

  const hasCustomDisclaimers = isCustomChallan('challan.disclaimers');
  const hasCustomFields = isCustomChallan('challan.fields');

  let org_logo = rzpLogo;
  let tableDetails = {};
  onMount(() => {
    if (bank_name?.startsWith('HDFC') || ifsc?.startsWith('HDFC')) {
      isHDFC = true;
      org_logo = hdfcLogo;
      disclaimers = HDFC_DISCLAIMERS;
      orgName = 'HDFC';
    }
    if (key === csdKey) {
      disclaimers.push({ text: csdDisclaimer, padding: 9 });
    }
    if (hasCustomDisclaimers) {
      disclaimers = [...disclaimers, ...getCustomDisclaimers()];
    }
    if (!isHDFC) {
      labels.ROW_HEADERS.row10 = 'Razorpay Order ID';
    }
    tableDetails = {
      [ROW_HEADERS.row1]: neftDetails.name,
      [ROW_HEADERS.row2]: account_number,
      [ROW_HEADERS.row3]: ifsc,
      [ROW_HEADERS.row4]: bank_name,
      [ROW_HEADERS.row5]: branch,
      [ROW_HEADERS.row6]: `${amount}`,
      [ROW_HEADERS.row7]: name.trim(),
      [ROW_HEADERS.row8]: $email,
      [ROW_HEADERS.row9]: $phone,
      [ROW_HEADERS.row10]: isHDFC ? description : orderId,
      [ROW_HEADERS.row11]: expiry,
    };
    printIfLoaded();
  });

  /**
   * converts a image to dataUrl and calls a callback
   * @param {String} src
   * @param {Func} callback
   * @param {String} outputFormat
   * @param {String} logoType
   * @returns null
   */
  function toDataUrl(src, callback, outputFormat, logoType) {
    let img = new window.Image();
    img.crossOrigin = 'anonymous';
    /**
     * Fix CORS related issue for chromium based browser due to cache
     * https://www.hacksoft.io/blog/handle-images-cors-error-in-chrome
     */
    img.src = src + '?' + new Date().getTime();
    if (!img) {
      onComplete();
    }

    img.onload = function () {
      /*image completely converted to base64string */
      let canvas = document.createElement('CANVAS');
      let ctx = canvas.getContext('2d');
      let dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      /* call back function */
      onComplete(dataURL);
    };

    img.onerror = function () {
      onComplete(false);
    };

    function onComplete(dataURL) {
      if (logoType === 'merchantLogo') {
        merchantLogoUrl = dataURL || false;
      } else {
        orgLogoUrl = dataURL || false;
      }
      if (callback) {
        callback();
      }
    }
  }

  const session = getSession();

  function stripOffNonUTF8Chars(text) {
    if (typeof text !== 'string') {
      return text;
    }
    return text.replace(/[^ -~]/g, '');
  }

  // TODO: move it to utils or use any currently existing methods for formatting
  function formatDate(d) {
    return stripOffNonUTF8Chars(
      `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    );
  }

  function addHorizintalLine() {
    doc.line(pdfStartX, top, pdfEndX, top);
  }

  function addVerticalLine(x, extraLinePadding) {
    doc.line(x, top, x, top + pdfColumnHeight + extraLinePadding);
  }

  function addRow(
    column1,
    column2,
    middleLine,
    extraLinePadding = 0,
    extraTextPadding = 0,
    extraBottomPadding = 0
  ) {
    addVerticalLine(pdfStartX, extraLinePadding);
    addVerticalLine(pdfEndX, extraLinePadding);
    const columnsLength = column1 && column2 ? 2 : column1 ? 1 : 0;
    if (middleLine) {
      addVerticalLine(pdfColumnSepX, extraLinePadding);
    }
    top += pdfTextPaddingTop + extraTextPadding;
    for (let i = 0; i < columnsLength; i++) {
      let { text, bold, x, imgUrl } = arguments[i];
      if (bold) {
        doc.setFontType('bold');
      }
      if (imgUrl) {
        doc.addImage(imgUrl, 'png', x, top - 2.5, 2.5, 2.5);
        x += 3;
      }
      if (text) {
        doc.text(text, x, top);
      }
      doc.setFontType('normal');
    }
    top += pdfTextBaddingBottom + extraBottomPadding;
    addHorizintalLine(doc, top);
  }
  /**
   * Using pdfjs for creating pdf
   * not using HTML to pdf conversion provided by jspdf as it increases the pdf size
   * Docs : http://raw.githack.com/MrRio/jsPDF/master/docs/
   */
  function pdfInit() {
    if ((merchantLogoUrl || merchantLogoUrl === false) && orgLogoUrl) {
      doc = new window.jsPDF();
      doc.setLineWidth(0.5);

      // merchant logo
      if (merchantLogoUrl) {
        doc.addImage(merchantLogoUrl, 'png', 10, 10, 20, 20);
      }

      // org logo
      if (isHDFC) {
        doc.addImage(orgLogoUrl, 'png', 180, 10, 20, 20);
      } else {
        doc.addImage(orgLogoUrl, 'png', 145, 21, 55, 9);
      }
      addHorizintalLine(doc);
      doc.setFontSize(10);

      // adding headers
      addRow({ text: HEADER, x: 80 });
      // adding date
      addRow({ text: `Date: ${formatDate(new Date())}`, x: 15 });

      for (let key in tableDetails) {
        if (!tableDetails[key]) {
          continue;
        }
        if (key === 'Amount') {
          addRow(
            { text: key, bold: true, x: 15 },
            {
              text: tableDetails[key],
              imgUrl: rupeeDataUrl,
              bold: false,
              x: 80,
            },
            true
          );
        } else {
          addRow(
            { text: key, bold: true, x: 15 },
            { text: tableDetails[key], bold: false, x: 80 },
            true
          );
        }
      }
      if (hasCustomFields) {
        let fields = getCustomFields();
        for (let field of fields) {
          addRow(
            { text: field.title, bold: true, x: 15 },
            { text: field.value, bold: false, x: 80 },
            true
          );
        }
      }
      addRow({ text: `${DISCLAIMER_LABEL}:`, bold: true, x: 15 });
      if (!hasCustomFields && !hasCustomDisclaimers) {
        addRow(null, null);
      }

      for (let i = 0; i < disclaimers.length; i++) {
        const dis = disclaimers[i];
        const text = doc.splitTextToSize(`${i + 1}.) ${dis.text}`, 180);
        addRow({ text, bold: false, x: 15 }, null, false, 16, 0, dis.padding);
      }
      if (!hasCustomFields && !hasCustomDisclaimers) {
        addRow(null, null, true);
      }
      addRow(
        { text: DIPOSITOR_SIGN_LABEL, bold: true, x: 154 },
        null,
        false,
        12,
        12
      );
      if (!hasCustomFields && !hasCustomDisclaimers) {
        addRow(null, null, true);
      }
      addRow({ text: OFFICE_USE.header, bold: false, x: 80 });

      for (let i = 0; i < OFFICE_USE.list.length; i++) {
        addRow({ text: OFFICE_USE.list[i], bold: true, x: 15 });
      }

      addRow({ text: AUTH_SIGN_LABEL, bold: true, x: 155 });

      addRow({ text: BRANCH_LABEL, bold: true, x: 167 });

      const CheckoutBridge = getCheckoutBridge();
      const iosBridge = getNewIosBridge();
      const urlString = doc.output('dataurlstring');
      const { platform } = getSDKMeta();

      /**
       * Incase of Android & IOS SDK's we are passing the filename
       * only along with base64 string to the native methods
       * But in case of web we call doc.save with filename & extension
       */
      if (
        CheckoutBridge &&
        platform === 'android' &&
        session.pdf_download_supported
      ) {
        CheckoutBridge.getPdfString('challan', urlString);
      } else if (
        iosBridge &&
        platform === 'ios' &&
        session.pdf_download_supported
      ) {
        iosBridge.postMessage({
          action: 'getPdfString',
          body: {
            title: 'challan',
            pdfUrl: urlString,
          },
        });
      } else {
        doc.save('challan.pdf');
      }

      session.hideErrorMessage();
      neftView.ownerDocument.defaultView.close();
    }
  }

  function printIfLoaded() {
    if (!merchant_logo) {
      merchantLogoUrl = false;
    } else {
      toDataUrl(merchant_logo, pdfInit, 'image/png', 'merchantLogo');
    }
    toDataUrl(org_logo, pdfInit, 'image/png', 'orgLogo');
  }
  if (!neftDetails.branch) {
    delete tableDetails.Branch;
  }
</script>

<div id="challan-div" class="neft-print-view" bind:this={neftView} />
