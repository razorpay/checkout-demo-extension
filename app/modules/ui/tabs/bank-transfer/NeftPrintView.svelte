<script lang="ts">
  import {
    getOption,
    getMerchantKey,
    getOrderId,
    getOrgDetails,
  } from 'razorpay';
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
    CHALLAN_FIELDS,
  } from './challanConstants';
  import {
    isCustomChallan,
    getCustomFields,
    getCustomDisclaimers,
    createChallanDetailTableData,
    addCustomFields,
  } from './helper';
  import { getCheckoutBridge, getNewIosBridge } from 'bridge';
  import { getSDKMeta } from 'checkoutstore/native';

  const {
    HEADER,
    FIELD_PAIRS,
    OFFICE_USE,
    HDFC_DISCLAIMERS,
    NON_HDFC_DISCLAIMERS,
    DISCLAIMER_LABEL,
    DIPOSITOR_SIGN_LABEL,
    AUTH_SIGN_LABEL,
    BRANCH_LABEL,
    HDFC_HEADER,
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
  const pdfColumnSepX2 = 120;
  const pdfColumnSepX3 = 162;
  let top = 40;
  let doc;

  const key = getMerchantKey();

  const name = getOption('prefill.name');

  const { account_number, ifsc, branch, bank_name } = neftDetails;

  const hasCustomDisclaimers = isCustomChallan('challan.disclaimers');
  const hasCustomFields = isCustomChallan('challan.fields');

  let isMinimalDesign = false;

  let org_logo = rzpLogo;
  let tableDetails: { id: string; title: string; value?: string }[] = [];
  const { checkout_logo_url } = getOrgDetails() || {};

  onMount(() => {
    if (bank_name?.startsWith('HDFC') || ifsc?.startsWith('HDFC')) {
      isHDFC = true;
      org_logo = checkout_logo_url || hdfcLogo;
      disclaimers = HDFC_DISCLAIMERS;
      orgName = 'HDFC';
    }
    if (key === csdKey) {
      disclaimers.push({ text: csdDisclaimer, padding: 9 });
    }
    if (hasCustomDisclaimers) {
      disclaimers = [...disclaimers, ...getCustomDisclaimers()];
    }

    // threshold value to switch to new design
    const switchDesignThreshold = isHDFC ? 2 : 3;

    if (hasCustomDisclaimers || hasCustomFields) {
      const newFields = getCustomFields().filter((item) => !item.id) || [];
      isMinimalDesign =
        (newFields.length || 0) + (getCustomDisclaimers()?.length || 0) >=
        switchDesignThreshold;
    }

    if (!isHDFC) {
      labels.ROW_HEADERS = labels.ROW_HEADERS.map((item) => {
        if (item.id === CHALLAN_FIELDS.ORDER_ID) {
          item = { ...item, title: 'Razorpay Order ID' };
        }
        return item;
      });
    }

    const amountInString = amount.toString() || '';

    tableDetails = createChallanDetailTableData(labels.ROW_HEADERS, {
      [CHALLAN_FIELDS.BENEFICIARY_NAME]: neftDetails.name,
      [CHALLAN_FIELDS.ACCOUNT_NO]: account_number,
      [CHALLAN_FIELDS.IFSC_CODE]: ifsc,
      [CHALLAN_FIELDS.BANK]: bank_name || '',
      [CHALLAN_FIELDS.BRANCH]: branch || '',
      [CHALLAN_FIELDS.AMOUNT]: amountInString,
      [CHALLAN_FIELDS.CUSTOMER_NAME]: name.trim(),
      [CHALLAN_FIELDS.CUSTOMER_EMAIL]: $email,
      [CHALLAN_FIELDS.CUSTOMER_MOBILE]: $phone,
      [CHALLAN_FIELDS.ORDER_ID]: isHDFC ? orderId || description : orderId,
      [CHALLAN_FIELDS.EXPIRY]: expiry,
    });

    if (hasCustomFields) {
      tableDetails = addCustomFields(tableDetails);
    }

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
  function formatDate(d): string {
    return stripOffNonUTF8Chars(
      `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    );
  }

  function addHorizintalLine() {
    doc.line(pdfStartX, top, pdfEndX, top);
  }

  function addVerticalLine(x: number, extraLinePadding: number) {
    doc.line(x, top, x, top + pdfColumnHeight + extraLinePadding);
  }

  function addRow({
    column = [],
    middleLine = false,
    extraLinePadding = 0,
    extraTextPadding = 0,
    extraBottomPadding = 0,
    middleLine2 = false,
    middleLine3 = false,
  }) {
    addVerticalLine(pdfStartX, extraLinePadding);
    addVerticalLine(pdfEndX, extraLinePadding);
    const columnsLength = column.length;

    if (middleLine) {
      doc.setLineWidth(0.2);
      addVerticalLine(pdfColumnSepX, extraLinePadding);
      doc.setLineWidth(0.5);
    }
    if (middleLine2) {
      addVerticalLine(pdfColumnSepX2, extraLinePadding);
    }
    if (middleLine3) {
      doc.setLineWidth(0.2);
      addVerticalLine(pdfColumnSepX3, extraLinePadding);
      doc.setLineWidth(0.5);
    }
    top += pdfTextPaddingTop + extraTextPadding;
    for (let i = 0; i < columnsLength; i++) {
      let { text, bold, x, imgUrl } = column[i];
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
        doc.addImage(orgLogoUrl, 'png', 140, 10, 60, 20);
      } else {
        doc.addImage(orgLogoUrl, 'png', 145, 21, 55, 9);
      }
      addHorizintalLine(doc);
      doc.setFontSize(10);

      const date = `Date: ${formatDate(new Date()) || ''}`;
      // adding headers and date

      addRow({
        column: [
          { text: isHDFC ? HDFC_HEADER : HEADER, x: 15 },
          { text: date, x: 150 },
        ],
      });

      tableDetails?.forEach((item) => {
        const pairLeftElements = Object.keys(FIELD_PAIRS);
        const pairRightElements = Object.values(FIELD_PAIRS);

        const title = item.title?.substring(0, 30) || '';
        const value = item.value?.substring(0, 75) || '';
        let imgUrl = '';

        if (!value) {
          return;
        }
        if (item.id === CHALLAN_FIELDS.AMOUNT) {
          imgUrl = rupeeDataUrl;
        } else {
          imgUrl = '';
        }

        if (item.id === CHALLAN_FIELDS.BENEFICIARY_NAME) {
          const text = doc.splitTextToSize(item.value, 115);
          addRow({
            column: [
              { text: title, bold: true, x: 15 },
              { text: text, bold: false, imgUrl, x: 73 },
            ],
            middleLine: true,
            extraLinePadding: 16,
            extraBottomPadding: text?.length > 1 ? text?.length * 2 : 0,
          });
        } else if (pairLeftElements.includes(item.id) && isMinimalDesign) {
          const pairData = tableDetails.find(
            (elem) => elem.id === FIELD_PAIRS[item.id]
          );
          const pairTitle = pairData?.title.substring(0, 30);

          if (pairData) {
            addRow({
              column: [
                { text: title, bold: true, x: 15 },
                {
                  text: value,
                  imgUrl,
                  bold: false,
                  x: 73,
                },
                { text: pairTitle, bold: true, x: 123 },
                { text: pairData.value, bold: false, x: 165 },
              ],
              middleLine: true,
              middleLine2: true,
              middleLine3: true,
            });
          } else {
            addRow({
              column: [
                { text: title, bold: true, x: 15 },
                {
                  text: value,
                  imgUrl,
                  bold: false,
                  x: 73,
                },
              ],
              middleLine: true,
            });
          }
        } else if (isMinimalDesign && pairRightElements.includes(item.id)) {
          return;
        } else {
          addRow({
            column: [
              { text: title, bold: true, x: 15 },
              { text: value, imgUrl, bold: false, x: 73 },
            ],
            middleLine: true,
          });
        }
      });

      addRow({ column: [{ text: `${DISCLAIMER_LABEL}:`, bold: true, x: 15 }] });
      if (!hasCustomFields && !hasCustomDisclaimers) {
        addRow({});
      }
      if (isMinimalDesign) {
        doc.setFontSize(8);
      }
      for (let i = 0; i < disclaimers.length; i++) {
        const dis = disclaimers[i];
        const text = doc.splitTextToSize(`${i + 1}.) ${dis.text}`, 180);
        const bottomPadding = isMinimalDesign
          ? text.length > 1
            ? text.length * 2
            : 0
          : dis.padding;
        addRow({
          column: [{ text, bold: false, x: 15 }],
          extraLinePadding: 16,
          extraBottomPadding: bottomPadding,
        });
      }
      if (isMinimalDesign) {
        doc.setFontSize(10);
      }
      if (!hasCustomFields && !hasCustomDisclaimers) {
        addRow({ middleLine: true });
      }
      addRow({
        column: [{ text: DIPOSITOR_SIGN_LABEL, bold: true, x: 154 }],
        middleLine: false,
        extraLinePadding: 12,
        extraTextPadding: 12,
      });
      if (!hasCustomFields && !hasCustomDisclaimers) {
        addRow({ middleLine: true });
      }

      addRow({ column: [{ text: OFFICE_USE.header, bold: false, x: 80 }] });

      if (isMinimalDesign) {
        for (let i = 0; i < OFFICE_USE.list.length; i = i + 2) {
          addRow({
            column: [
              { text: OFFICE_USE.list[i], bold: true, x: 15 },
              { text: OFFICE_USE.list[i + 1], bold: true, x: 123 },
            ],
            middleLine2: i !== OFFICE_USE.list.length - 1,
          });
        }
      } else {
        for (let i = 0; i < OFFICE_USE.list.length; i++) {
          addRow({ column: [{ text: OFFICE_USE.list[i], bold: true, x: 15 }] });
        }
      }

      addRow({ column: [{ text: AUTH_SIGN_LABEL, bold: true, x: 155 }] });
      addRow({ column: [{ text: BRANCH_LABEL, bold: true, x: 167 }] });

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
    tableDetails = tableDetails.filter(
      (item) => item.id === CHALLAN_FIELDS.BRANCH
    );
  }
</script>

<div id="challan-div" class="neft-print-view" bind:this={neftView} />
