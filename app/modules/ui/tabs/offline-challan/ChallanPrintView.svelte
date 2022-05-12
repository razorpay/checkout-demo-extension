<script>
  // svelte imports
  import { onMount } from 'svelte';

  import { Events, OfflineChallanEvents } from 'analytics';

  //store
  import { phone } from 'checkoutstore/screens/home';

  // utils
  import { getOption } from 'razorpay';
  import { getSession } from 'sessionmanager';
  import {
    insertChallanDetailsInPDF,
    loadImageToDataUrl,
    createChallanDetailTableData,
    savePDF,
  } from 'ui/tabs/offline-challan/helper';

  // constants
  import { rzpLogo, hdfcLogo } from 'ui/tabs/bank-transfer/challanConstants';
  import { labels } from 'ui/tabs/offline-challan/constants';

  const { ALLOTTEE_HEADER, BANK_HEADER, TABLE_DETAILS_LABELS } = labels;

  // props
  export let challanDetails;
  export let expiry;
  export let amount;

  let neftView;
  let doc;
  const name = getOption('prefill.name');
  const {
    challan_number,
    ifsc,
    bank_name,
    name: beneficiaryName,
    client_code,
    customerAdditionalInfo,
  } = challanDetails;
  let org_logo = rzpLogo;
  let tableDetails = {};
  const session = getSession();

  const generateChallanConfig = {
    bounds: {
      x: 10,
      y: 10,
      width: 190,
    },
    rectHeight: 8,
    textHeight: 2.1,
    fontSize: 10,
    paddingX: 2,
    paddingY: 4,
  };

  function stripOffNonUTF8Chars(text) {
    if (typeof text !== 'string') {return text;}
    return text.replace(/[^ -~]/g, '');
  }

  function formatDate(d) {
    return stripOffNonUTF8Chars(
      `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    );
  }

  function printIfLoaded() {
    loadImageToDataUrl(org_logo, 'image/png').then((dataURL) => {
      doc = new window.jsPDF();
      const docDate = formatDate(new Date());
      insertChallanDetailsInPDF(doc, {
        ...generateChallanConfig,
        orgLogoUrl: dataURL,
        data: {
          tableDetails,
          header: ALLOTTEE_HEADER,
          date: docDate,
        },
      });

      doc.addPage();
      insertChallanDetailsInPDF(doc, {
        ...generateChallanConfig,
        orgLogoUrl: dataURL,
        data: {
          tableDetails,
          header: BANK_HEADER,
          date: docDate,
        },
      });
      savePDF(doc, session.pdf_download_supported, 'challan');
      session.hideErrorMessage();
      neftView.ownerDocument.defaultView.close();
      Events.TrackBehav(OfflineChallanEvents.PRINT_DOWNLOADED);
    });
  }

  if (!challanDetails.branch) {
    delete tableDetails.Branch;
  }

  onMount(() => {
    if (bank_name?.startsWith('HDFC') || ifsc?.startsWith('HDFC')) {
      org_logo = hdfcLogo;
    }
    tableDetails = createChallanDetailTableData(TABLE_DETAILS_LABELS, {
      beneficiaryName,
      cmsCode: client_code,
      amount: `${amount}`,
      eChallanNo: challan_number,
      formNo: '',
      uniquePropertyId: customerAdditionalInfo?.property_id,
      rollNo: customerAdditionalInfo?.roll_number,
      admissionNo: customerAdditionalInfo?.admission_number,
      tenderId: customerAdditionalInfo?.tender_id,
      customerId: '',
      customerName: name,
      customerEmailId: '',
      customerMobileNo: $phone,
      expiryOfChallan: expiry,
    });
    printIfLoaded();
  });
</script>

<div id="challan-div" class="neft-print-view" bind:this={neftView} />
