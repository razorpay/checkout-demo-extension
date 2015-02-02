Razorpay.templates.loader = '
  <style>
    .rzp-loader {
      display: block;
      position: relative;
      left: 50%;
      top: 50%;
      width: 150px;
      height: 150px;
      margin: -75px 0 0 -75px;
      border-radius: 50%;
      border: 5px solid transparent;
      border-top-color: #29b7d6;
      -webkit-animation: spin 2s linear infinite;
      animation: spin 2s linear infinite;
    }
    .rzp-loader:before {
      content: "";
      position: absolute;
      top: 5px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      border-radius: 50%;
      border: 5px solid transparent;
      border-top-color: #0b81b2;
      -webkit-animation: spin 3s linear infinite;
      animation: spin 3s linear infinite;
    }
    .rzp-loader:after {
      content: "";
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border-radius: 50%;
      border: 5px solid transparent;
      border-top-color: #29b7d6;
      -webkit-animation: spin 1.5s linear infinite;
      animation: spin 1.5s linear infinite;
    }

    .rzp-loader img {
      width: 80px;
      position: absolute;
      top: 35px;
      left: 35px;
      -webkit-animation: antispin 2s linear infinite;
      animation: antispin 2s linear infinite;
    }

    @-webkit-keyframes spin {
      0%{
        -webkit-transform: rotate(0deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(0deg);  /* IE 9 */
        transform: rotate(0deg);  /* Firefox 16+, IE 10+, Opera */
      }
      100% {
        -webkit-transform: rotate(360deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(360deg);  /* IE 9 */
        transform: rotate(360deg);  /* Firefox 16+, IE 10+, Opera */
      }
    }
    @-webkit-keyframes antispin {
      0%{
        -webkit-transform: rotate(360deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(360deg);  /* IE 9 */
        transform: rotate(360deg);  /* Firefox 16+, IE 10+, Opera */
      }
      100% {
        -webkit-transform: rotate(0deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(0deg);  /* IE 9 */
        transform: rotate(0deg);  /* Firefox 16+, IE 10+, Opera */
      }
    @keyframes spin {
      0%{
        -webkit-transform: rotate(0deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(0deg);  /* IE 9 */
        transform: rotate(0deg);  /* Firefox 16+, IE 10+, Opera */
      }
      100%{
        -webkit-transform: rotate(360deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(360deg);  /* IE 9 */
        transform: rotate(360deg);  /* Firefox 16+, IE 10+, Opera */
      }
    }
  </style>
  <div class="rzp-loader" id="{{=it.id}}">
  <img src="{{=it.src}}" alt="">
  </div>'
