export const generateQuerySelector = function (el) {
  if (el.tagName.toLowerCase() == "html") return "HTML";
  let str = el.tagName;
  str += el.id != "" ? "#" + el.id : "";
  if (el.className) {
    let classes = el.className.split(/\s/);
    for (let i = 0; i < classes.length; i++) {
      str += "." + classes[i];
    }
  }
  return generateQuerySelector(el.parentNode) + " > " + str;
};

export function querySelectorFallback(context) {
  let index, pathSelector, localName;

  if (context == "null") throw "not an dom reference";
  // call getIndex function
  index = getIndex(context);

  while (context.tagName) {
    // selector path
    pathSelector = context.localName + (pathSelector ? ">" + pathSelector : "");
    context = context.parentNode;
  }
  // selector path for nth of type
  pathSelector = pathSelector + `:nth-of-type(${index})`;
  return pathSelector;
}

// get index for nth of type element
function getIndex(node) {
  let i = 1;
  let tagName = node.tagName;

  while (node.previousSibling) {
    node = node.previousSibling;
    if (
      node.nodeType === 1 &&
      tagName.toLowerCase() == node.tagName.toLowerCase()
    ) {
      i++;
    }
  }
  return i;
}

export function getToastStyles() {
  return `
  #toast  {
    visibility: hidden;
    min-width: 250px;
    background-color: #0400ff;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    color: white;
    text-align: center;
    border-radius: 10px;
    padding: 16px;
    position: fixed;
    z-index: 10000;
    left: 50%;
    transform: translateX(-50%);
    bottom: 30px;
    font-size: 16px;
  }
  
  #toast.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
  }
  
  @-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
  }
  
  @keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
  }
  
  @-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 0; opacity: 0;}
  }
  
  @keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
  }
  `;
}

export function getModalStyles() {
  return `
  #modal {
    visibility: hidden;
    min-width: 250px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background-color: #fff;
    text-align: center;
    border-radius: 10px;
    padding: 16px;
    position: fixed;
    z-index: 10000;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    font-size: 16px;
  }

  #modal h2 {
    margin-bottom: 20px;
  }

  #modal.success {
    border-top: 8px solid #6ECD28;
  }

  #modal.fail {
    border-top: 8px solid #CD2828;
  }

  .close-btn {
    border-radius: 25px;
    width: 25px;
    height: 25px;
    border: none;
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
  }

  #modal .content {
    min-height: 100px;
    min-width: 300px;
  }
  
  #modal.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s;
    animation: fadein 0.5s;
  }
  
  @-webkit-keyframes fadein {
    from {transform: translateX(-50%) translateY(0%); opacity: 0;} 
    to {transform: translateX(-50%) translateY(-50%); opacity: 1;}
  }
  
  @keyframes fadein {
    from {transform: translateX(-50%) translateY(0%); opacity: 0;}
    to {transform: translateX(-50%) translateY(-50%); opacity: 1;}
  }

  #modal.hide {
    visibility: hidden;
  }

  `;
}

const styleSheet = document.createElement("style");
styleSheet.innerText = `${getToastStyles()} ${getModalStyles()}`;
document.head.appendChild(styleSheet);

const toast = document.createElement("div");
toast.setAttribute("id", "toast");
toast.textContent = "Copied !";
document.body.appendChild(toast);

export function showToast({ text, time = 3000 }) {
  toast.textContent = text;
  const x = document.getElementById("toast");
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, time);
}

const modal = document.createElement("div");
modal.setAttribute("id", "modal");
document.body.appendChild(modal);

const getModalContent = (data) => {
  return `
  <div class="content">
    <h2>${data.state === "success" ? "Success !" : "Fail"}</h2>
    <em>Payment ID: ${data.razorpay_payment_id}</em>
    <button class="close-btn">X</button>
  </div>
  `;
};

export function showModal(data) {
  const x = document.getElementById("modal");
  x.innerHTML = getModalContent(data);
  x.classList.remove("hide");
  if (data.state === "success") {
    x.classList.add("show", "success");
  } else {
    x.classList.add("show", "fail");
  }

  document.querySelector("#modal .close-btn").addEventListener("click", () => {
    const x = document.getElementById("modal");
    x.className = "hide";
  });
}

function createRecordFromElement(element, extractOnlyNumbers = true) {
  const text = element.textContent.trim();
  let record = {};
  const bBox = element.getBoundingClientRect();

  if (text.length <= 30 && !(bBox.x == 0 && bBox.y == 0)) {
    record.fontSize = parseInt(getComputedStyle(element).fontSize);
  }
  record.y = bBox.y;
  record.x = bBox.x;
  record.height = bBox.height;
  record.width = bBox.width;
  record.text = extractOnlyNumbers
    ? text.replace(/[^0-9.]/g, "")
    : text.toLowerCase();
  record.element = element;

  return record;
}

function filterContentInsideViewport(elem) {
  if (
    elem.x > window.innerWidth ||
    elem.x < 0 ||
    elem.y > window.innerHeight ||
    elem.y < 0
  ) {
    return false;
  }
  return true;
}

function filterSmallCTAs(elem) {
  if (elem.width > 300 || elem.height > 100) {
    return false;
  }
  return true;
}

function canBePrice(record) {
  if (
    record.y > 600 ||
    record.fontSize == undefined ||
    !/\d/.test(record.text) ||
    !record.text.match(
      /(^(US ){0,1}(rs\.|Rs\.|RS\.|\$|₹|INR|RM|USD|CAD|C\$){0,1}(\s){0,1}[\d,]+(\.\d+){0,1}(\s){0,1}(AED){0,1}$)/
    )
  )
    return false;
  else return true;
}

/**
 * follows below order of algo to extract price
 * 1. check og tags, return textContent if node is present
 * 2. check itemprop="price" attribute, return textContent if node is present
 * 3. fallback algo
 *    - get all elements from body
 *    - create records from each element (x, y, text)
 *    - filter out records that are outside viewable viewport
 *    - filter out records that have number in text or have currency
 *    - sort records by largest font-size
 *    - return the first record
 *
 * @returns price
 */
export const scrapeAmountFromPage = () => {
  // 1st check
  if (document.querySelector('meta[property="og:price:amount"]')) {
    return document.querySelector('meta[property="og:price:amount"]').content;
  }

  // 2nd check
  if (document.querySelector('[itemprop="price"]')) {
    return document.querySelector('[itemprop="price"]').textContent;
  }

  // 3rd fallback algo
  let elements = [...document.querySelectorAll(" body *")];

  let records = elements
    .map(createRecordFromElement)
    .filter(filterContentInsideViewport)
    .filter(canBePrice);

  let recordsSortedByFontSize = records.sort((a, b) => {
    if (a.fontSize === b.fontSize) return a.y < b.y ? -1 : 1;
    return a.fontSize < b.fontSize ? 1 : -1;
  });

  let priceInNumbers = recordsSortedByFontSize[0]?.text;
  return priceInNumbers;
};

const filterByCTAtext = (element) => {
  if (element.text?.includes("buy") || element.text?.includes("cart")) {
    return true;
  }
};

export const scrapeCTAsFromPage = () => {
  var elements = [...document.querySelectorAll("button, div")];

  let records = elements
    .map((ele) => createRecordFromElement(ele, false))
    .filter(filterContentInsideViewport)
    .filter(filterByCTAtext)
    .filter(filterSmallCTAs);

  return records;
};

scrapeCTAsFromPage();

export const scrapeNameFromPage = () => {
  let domain = window.location.hostname;

  // Remove path and query string
  domain = domain.split("/")[0];

  // Remove subdomain
  const parts = domain.split(".");
  domain = parts[parts.length - 2];

  return domain.charAt(0).toUpperCase() + domain.slice(1);
};

function isImageSourceValid(url, callback) {
  let image = new Image();

  image.onload = function () {
    callback(true);
  };

  image.onerror = function () {
    callback(false);
  };

  image.src = url;
}

function getFaviconSource() {
  let links = document.getElementsByTagName("link");
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    if (
      link.getAttribute("rel") === "icon" ||
      link.getAttribute("rel") === "shortcut icon"
    ) {
      let faviconSource = link.getAttribute("href");
      if (faviconSource[0] === "/") {
        faviconSource = `${location.protocol}//${location.host}${faviconSource}`;
      }
      return faviconSource;
    }
  }
  return null; // Return null if no favicon source is found
}

export const scrapeLogoFromPage = () => {
  return new Promise((resolve, reject) => {
    const favIconSource = getFaviconSource();

    isImageSourceValid(favIconSource, (valid) => {
      if (valid) {
        resolve(favIconSource);
      } else {
        const testIcon = `${location.protocol}//${location.host}/favicon.ico`;
        isImageSourceValid(testIcon, (valid) => {
          if (valid) resolve(testIcon);
          else resolve("");
        });
      }
    });
  });
};

function rgbToHex(rgb) {
  var regex = /(\d{1,3}),(\d{1,3}),(\d{1,3})/;
  var match = rgb.match(regex);

  if (match) {
    var r = parseInt(match[1], 10);
    var g = parseInt(match[2], 10);
    var b = parseInt(match[3], 10);

    var hexR = r.toString(16).padStart(2, "0");
    var hexG = g.toString(16).padStart(2, "0");
    var hexB = b.toString(16).padStart(2, "0");

    return "#" + hexR + hexG + hexB;
  }

  return null; // Return null if the input is not a valid RGB string
}

const createCanvas = (image, callback) => {
  image.onload = function () {
    // Create a canvas element to draw the image
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    context.drawImage(image, 0, 0);

    // Get the pixel data from the canvas
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;

    // Count the color frequencies
    let colorFrequencies = {};
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
      let color = "rgb(" + r + "," + g + "," + b + ")";

      if (colorFrequencies[color]) {
        colorFrequencies[color]++;
      } else {
        colorFrequencies[color] = 1;
      }
    }

    // Find the color with the highest frequency
    let maxFrequency = 0;
    let mostUsedColor = "";
    for (let color in colorFrequencies) {
      if (
        colorFrequencies[color] > maxFrequency &&
        color !== "rgb(255,255,255)"
      ) {
        maxFrequency = colorFrequencies[color];
        mostUsedColor = color;
      }
    }

    callback(rgbToHex(mostUsedColor));
  };
};

export const scrapeColourFromImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (imageUrl.includes(window.location.origin)) {
      let image = new Image();
      image.src = imageUrl;

      createCanvas(image, (res) => {
        resolve(res);
      });
    } else {
      return fetch("https://cors-anywhere.herokuapp.com/" + imageUrl)
        .then(function (response) {
          return response.blob();
        })
        .then(function (blob) {
          let image = new Image();
          let imageUrl = URL.createObjectURL(blob);
          image.src = imageUrl;

          createCanvas(image, (res) => {
            resolve(res);
          });
        });
    }
  });
};

const scrapeProductImage = () => {
  // Find all image elements in the parsed HTML content
  const images = document.getElementsByTagName("img");
  // .filter(filterContentInsideViewport);

  // Initialize variables to hold the largest image and its size
  let largestImage = null;
  let largestSize = 0;

  // Iterate through the images and find the largest one
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const width = image.naturalWidth || image.offsetWidth;
    const height = image.naturalHeight || image.offsetHeight;
    const imageSize = width * height;

    // Compare the current image size with the largest size found so far
    if (imageSize > largestSize) {
      largestImage = image;
      largestSize = imageSize;
    }
  }

  return largestImage?.src || "";
};

const scrapeProductName = () => {
  let name = document.title;

  // discard characters after hyphen or colon, in most cases this will just have site info which we don't want
  name = name.split(/[-:|]/)[0];

  // remove keywords like Buy
  return name.replace("/buy/i", "").slice(0, 128);
};

export const scrapeLineItem = () => {
  return {
    name: scrapeProductName(),
    image_url: scrapeProductImage(),
    quantity: 1,
  };
};

export const createOrder = (data, line_item) => {
  const payload = {
    currency: "INR",
    amount: data.amount / 100,
    line_items_total: data.amount / 100,
    line_items: [
      {
        ...line_item,
        price: data.amount / 100,
      },
    ],
  };
  return fetch("https://demo-shopping-app.onrender.com/payment/orders", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((res) => {
    return res.json();
  });
};
