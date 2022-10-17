import { getOption } from 'razorpay';

// analytics
import { Events, OfflineChallanEvents } from 'analytics';

// bridge
import { getCheckoutBridge, getNewIosBridge } from 'bridge';
import { getSDKMeta } from 'checkoutstore/native';

// helpers
import { makeAuthUrl } from 'common/makeAuthUrl';
import { copyToClipboard } from 'common/clipboard';
import loadScript from 'common/loadScript';
import fetch from 'utils/fetch';
import { capture as captureError, SEVERITY_LEVELS } from 'error-service';

// constants
import { rupeeDataUrl, jsPdfUrl } from 'ui/tabs/bank-transfer/challanConstants';
import { labels } from 'ui/tabs/offline-challan/constants';

function getPayloadForVirtualAccounts() {
  const payload = {
    receivers: ['offline_challan'],
  };
  const customer_id = getOption('customer_id');
  if (customer_id) {
    payload.customer_id = customer_id;
  }
  return payload;
}

export function createVirtualAccount(orderId) {
  return new Promise((resolve) => {
    const data = getPayloadForVirtualAccounts();

    Events.TrackBehav(OfflineChallanEvents.SUBMIT_DATA, {
      data,
    });

    let url = makeAuthUrl(`orders/${orderId}/virtual_accounts`);

    fetch.post({
      url,
      data,
      callback: resolve,
    });
  });
}

export function copyDetailsToClipboard(elm, text) {
  return new Promise((resolve) => {
    copyToClipboard(elm, text);
    setTimeout(resolve, 3000);
  });
}

export async function loadJsPdf() {
  try {
    await loadScript(jsPdfUrl);
  } catch (err) {
    captureError(err, {
      analytics: {
        event: 'offline_jspdf_loading_failed',
        data: {},
      },
      severity: SEVERITY_LEVELS.S1,
    });
  }
}

export function loadImageToDataUrl(src, outputFormat) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    /**
     * Fix CORS related issue for chromium based browser due to cache
     * https://www.hacksoft.io/blog/handle-images-cors-error-in-chrome
     */
    img.src = src + '?' + new Date().getTime();
    if (!img) {
      resolve(false);
    }

    img.onload = function () {
      /*image completely converted to base64string */
      const canvas = document.createElement('CANVAS');
      const ctx = canvas.getContext('2d');
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL(outputFormat);
      /* call back function */
      resolve(dataURL);
    };

    img.onerror = function () {
      resolve(false);
    };
  });
}

export function createChallanDetailTableData(labels, data) {
  const formattedData = [];
  if (data.beneficiaryName) {
    formattedData.push({
      label: labels.beneficiaryName,
      value: data.beneficiaryName,
    });
  }
  if (data.cmsCode) {
    formattedData.push({
      label: labels.cmsCode,
      value: data.cmsCode,
    });
  }
  if (data.amount) {
    formattedData.push({
      label: labels.amount,
      value: data.amount,
    });
  }
  if (data.eChallanNo) {
    formattedData.push({
      label: labels.eChallanNo,
      value: data.eChallanNo,
    });
  }
  if (data.formNo) {
    formattedData.push({
      label: labels.formNo,
      value: data.formNo,
    });
  }
  if (data.uniquePropertyId) {
    formattedData.push({
      label: labels.uniquePropertyId,
      value: data.uniquePropertyId,
    });
  }
  if (data.rollNo) {
    formattedData.push({
      label: labels.rollNo,
      value: data.rollNo,
    });
  }
  if (data.admissionNo) {
    formattedData.push({
      label: labels.admissionNo,
      value: data.admissionNo,
    });
  }
  if (data.tenderId) {
    formattedData.push({
      label: labels.tenderId,
      value: data.tenderId,
    });
  }
  formattedData.push({
    label: labels.customerId,
    value: '__keep__',
  });
  if (data.customerName) {
    formattedData.push({
      label: labels.customerName,
      value: data.customerName,
    });
  }
  formattedData.push({
    label: labels.customerEmailId,
    value: '__keep__',
  });
  if (data.customerMobileNo) {
    formattedData.push({
      label: labels.customerMobileNo,
      value: data.customerMobileNo,
    });
  }
  if (data.expiryOfChallan) {
    formattedData.push({
      label: labels.expiryOfChallan,
      value: data.expiryOfChallan,
    });
  }
  formattedData.push({
    label: labels.gst,
    value: '__keep__', // Print only label name on PDF
  });
  formattedData.push({
    label: labels.pan,
    value: '__keep__', // Print only label name on PDF
  });
  return formattedData;
}

function createChallanDetailTable(
  doc,
  { data, bounds, paddingX, paddingY, rectHeight, textHeight }
) {
  const left = bounds.left;
  let top = bounds.y;
  const colSize = bounds.width * 0.5;
  data.forEach((item) => {
    if (item.value) {
      let boxHeight = rectHeight;
      doc.setFontType('bold');
      const splittedTexts = doc.splitTextToSize(item.label, colSize);
      let splitY = top + paddingY + 1;
      splittedTexts.forEach((text) => {
        doc.text(text, left + paddingX, splitY);
        splitY += paddingY + 3;
      });
      boxHeight *= splittedTexts.length;
      doc.setFontType('normal');
      if (item.value === '__keep__') {
        doc.text('', left + colSize + paddingX, top + paddingY + 1);
      } else {
        let x = left + colSize + paddingX;
        if (item.label === 'Amount') {
          doc.addImage(
            rupeeDataUrl,
            'png',
            x,
            top + textHeight,
            textHeight,
            textHeight
          );
          x += paddingX + 1;
        }
        doc.text(item.value, x, top + paddingY + 1);
      }
      doc.rect(left, top, colSize, boxHeight);
      doc.rect(left + colSize, top, colSize, boxHeight);
      top += boxHeight;
    }
  });
  return top;
}

function createNoteDenominationTable(
  doc,
  { data, bounds, paddingX, paddingY, rectHeight }
) {
  const left = bounds.left;
  let top = bounds.y;
  let colSizes = [0.6, 0.2, 0.2];
  data.forEach((row, rowIdx) => {
    let x = left;
    if (rowIdx === 0) {
      doc.setFontType('bold');
    }
    row.forEach((col, i) => {
      const colSize = colSizes[i] * bounds.width;
      doc.rect(x, top, colSize, rectHeight);
      if (col) {
        doc.text(col, x + paddingX, top + paddingY + 1);
      }
      x += colSize;
    });
    if (rowIdx === 0) {
      doc.setFontType('normal');
    }
    top += rectHeight;
  });
  return top;
}

function createColumnsBounds({ left, right, width }) {
  const colSize = width * 0.55;
  return {
    col1: {
      left: left,
      right: left + colSize,
      width: colSize,
    },
    col2: {
      left: left + colSize,
      right: right,
      width: width - colSize,
    },
  };
}

export function insertChallanDetailsInPDF(
  doc,
  {
    bounds,
    orgLogoUrl,
    paddingX,
    paddingY,
    fontSize,
    data,
    rectHeight,
    textHeight,
  }
) {
  const {
    BANK_NAME,
    NOTE_DENOMINATION,
    DISCLAIMER_LABEL,
    HDFC_DISCLAIMERS,
    DIPOSITOR_SIGN_LABEL,
    OFFICE_USE,
    AUTH_SIGN_LABEL,
    BRANCH_LABEL,
  } = labels;
  const left = bounds.x;
  const width = bounds.width;
  const right = width + left;
  const mid = left + Math.round(width / 2);
  let top = bounds.y;

  doc.setLineWidth(0.3);
  doc.setFontSize(fontSize);

  // HDFC Logo
  doc.addImage(orgLogoUrl, 'png', right - 15, top, 15, 15);
  top += paddingY + 15;

  doc.rect(left, top, width, 15);
  doc.setFontType('bold');
  let textTop = top + paddingY + 1;
  doc.text(data.header, mid - 11, textTop);
  textTop += textHeight + paddingY;
  doc.text(BANK_NAME, mid - 18, textTop);
  doc.setFontType('normal');
  top += 15;

  doc.rect(left, top, width, rectHeight);
  doc.text(`Date: ${data.date}`, left + paddingX, top + paddingY + 1);
  top += rectHeight;

  const colsBounds = createColumnsBounds({ left, right, width });

  const leftColTop = createChallanDetailTable(doc, {
    data: data.tableDetails,
    bounds: { ...colsBounds.col1, y: top },
    paddingX,
    paddingY,
    rectHeight,
    textHeight,
  });
  const rightColTop = createNoteDenominationTable(doc, {
    data: NOTE_DENOMINATION,
    bounds: { ...colsBounds.col2, y: top },
    paddingX,
    paddingY,
    rectHeight,
  });

  top = Math.max(rightColTop, leftColTop);

  if (leftColTop < rightColTop) {
    doc.rect(
      colsBounds.col1.left,
      leftColTop,
      colsBounds.col1.width,
      rightColTop - leftColTop
    );
  }

  if (leftColTop > rightColTop) {
    doc.rect(
      colsBounds.col2.left,
      rightColTop,
      colsBounds.col2.width,
      leftColTop - rightColTop
    );
  }
  doc.rect(left, top, width, rectHeight);
  doc.setFontType('bold');
  doc.text(DISCLAIMER_LABEL, left + paddingX, top + paddingY + 1);
  doc.setFontType('normal');
  top += rectHeight;

  HDFC_DISCLAIMERS.slice(2).forEach((dis, i) => {
    const text = doc.splitTextToSize(`${i + 1}) ${dis.text}`, width - paddingX);
    doc.rect(left, top, width, Math.max(dis.padding, rectHeight));
    let splitTextTop = top + paddingY + 1;
    text.forEach((splitTxt) => {
      doc.text(splitTxt, left + paddingX, splitTextTop);
      splitTextTop += textHeight + paddingY - 2;
    });
    top += Math.max(dis.padding, rectHeight);
  });

  doc.rect(left, top, width, 20);
  doc.setFontType('bold');
  doc.text(DIPOSITOR_SIGN_LABEL, right - left - 32, top + paddingY + 13);
  doc.setFontType('normal');
  top += 20;

  doc.rect(left, top, width, rectHeight);
  doc.text(OFFICE_USE.header, left + paddingX, top + paddingY + 1);
  top += rectHeight;

  doc.setFontType('bold');
  OFFICE_USE.list.forEach((item) => {
    doc.rect(left, top, width, rectHeight);
    doc.text(item, left + paddingX, top + paddingY + 1);
    top += rectHeight;
  });
  doc.setFontType('normal');
  HDFC_DISCLAIMERS.slice(0, 2).forEach((dis, i) => {
    const text = doc.splitTextToSize(`${i + 1}) ${dis.text}`, width - paddingX);
    doc.rect(left, top, width, Math.max(dis.padding, rectHeight));
    let splitTextTop = top + paddingY + 1;
    text.forEach((splitTxt) => {
      doc.text(splitTxt, left + paddingX, splitTextTop);
      splitTextTop += textHeight + paddingY - 2;
    });
    top += Math.max(dis.padding, rectHeight);
  });

  doc.setFontType('bold');
  doc.rect(left, top, width, rectHeight);
  doc.text(AUTH_SIGN_LABEL, right - left - 30, top + paddingY + 1);
  top += rectHeight;

  doc.rect(left, top, width, rectHeight);
  doc.text(BRANCH_LABEL, right - left - 19, top + paddingY + 1);
  top += rectHeight;
  doc.setFontType('normal');
}

export function savePDF(doc, pdfDownloadSupported, name) {
  const CheckoutBridge = getCheckoutBridge();
  const iosBridge = getNewIosBridge();
  const urlString = doc.output('dataurlstring');
  const { platform } = getSDKMeta();

  if (CheckoutBridge && platform === 'android' && pdfDownloadSupported) {
    CheckoutBridge.getPdfString(name, urlString);
  } else if (iosBridge && platform === 'ios' && pdfDownloadSupported) {
    iosBridge.postMessage({
      action: 'getPdfString',
      body: {
        title: name,
        pdfUrl: urlString,
      },
    });
  } else {
    doc.save(`${name}.pdf`);
  }
}
