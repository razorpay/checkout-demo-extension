export default (callBackName: string) => `<!DOCTYPE html>
<html lang="en">

<head>
    <title>Razorpay | Consent Page</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css?family=Muli:400,600,800" rel="stylesheet" />

    <style type="text/css">
        body,
        html {
            padding: 0;
            margin: 0;
        }

        body {
            background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjEwMCIgdmVyc2lvbj0iMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGRlZnM+PHBhdGggaWQ9ImEiIGQ9Ik0wIDBoMzYwdjEwMEgweiIvPjxwYXRoIGlkPSJjIiBkPSJNMCAwaDM3NHYxODFIMHoiLz48bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMTcwJSIgeDI9IjAlIiB5Mj0iMCUiIGlkPSJlIj48c3RvcCBzdG9wLWNvbG9yPSIjN0VERUZGIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iIzAwNDFCMSIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48bWFzayBpZD0iYiIgZmlsbD0iI2ZmZiI+PHVzZSB4bGluazpocmVmPSIjYSIvPjwvbWFzaz48ZyBtYXNrPSJ1cmwoI2IpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtOCAtNDMpIj48bWFzayBpZD0iZCIgZmlsbD0iI2ZmZiI+PHVzZSB4bGluazpocmVmPSIjYyIvPjwvbWFzaz48ZyBtYXNrPSJ1cmwoI2QpIj48cGF0aCBmaWxsPSIjRjRGOEZGIiBkPSJNLTQuNjExLTUuMzEyaDM4OS4zMjN2ODkuOTVMMjIuODkgMTMxLjE5N2wtMjcuNTAxLTE2LjIyNXoiLz48cGF0aCBmaWxsPSJ1cmwoI2UpIiBkPSJNMCAwaDM4OS4zMjR2MTI3Ljk3NGwtMjYuNjYyIDI0LjE3TDAgMTAxLjg4eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE1IC0xMCkiLz48L2c+PC9nPjwvZz48L2c+PC9zdmc+");
            background-repeat: no-repeat;
            background-size: contain;
            background-position-x: center;
            background-position-y: top;
            font-family: Muli, sans-serif;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
        }

        .powered-by {
            font-weight: 400;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }

        .powered-by span {
            font-weight: 600;
            font-size: 12px;
            line-height: 15px;
            color: #1f2849;
            mix-blend-mode: normal;
            opacity: 0.5;
        }

        .powered-by img {
            height: 18px;
            margin-left: 4px;
        }

        #app {
            margin: 0 auto;
            width: 95%;
            min-height: 100vh;
            max-width: 640px;
        }

        #app-container {
            margin: 24px 0;
            position: relative;
        }

        #view-content {
            /* width: 90%; */
            max-width: 640px;
            margin: 0 auto;
            padding: 0 24px;
            border-radius: 3px;
            background-color: #fff;
            -webkit-box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
            box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
            display: -webkit-box;
            display: -webkit-flex;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -webkit-flex-direction: column;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-pack: justify;
            -webkit-justify-content: space-between;
            -ms-flex-pack: justify;
            justify-content: space-between;
        }

        .hide-sm {
            display: block;
        }

        #consentForm {
            display: inline-grid;
            width: 100%;
            justify-items: center;
        }

        .secondary-button {
            border: 0px;
            border-bottom: 1px solid #655858;
            width: fit-content;
            color: #655858;
            background: white;
            margin: 13px 30px 13px 30px;
            padding: 0px;
            opacity: 0.8;
        }

        .title-card {
            padding: 17px 24px;
            background: #f4f8fe;
            text-align: center;
        }

        .title-text {
            font-weight: 600;
            font-size: 18px;
            line-height: 150%;
            text-transform: uppercase;
            color: #333;
            margin-bottom: 12px;
        }

        .divider {
            position: relative;
        }

        .divider:after {
            content: " ";
            border: 1px solid rgba(0, 0, 0, 0.059);
            width: calc(100% + 48px);
            margin-left: -24px;
            display: block;
            height: 0;
        }

        .powered-by-header {
            text-align: right;
        }

        .content {

            text-align: center;
            padding: 20px;
        }

        .content p {
            /* margin-top: 24px; */
            font-size: 16px;
            line-height: 21px;
            color: #404040;
            opacity: 0.7;
        }


        .visible {
            display: block !important;
        }

        @media screen and (max-width: 760px) {
            .hide-sm {
                display: none !important;
            }

            .title-text {
                margin-bottom: 6px;
                font-size: 16px;
            }

            #view-content>div>div {
                padding: 13px;
            }

            .divider:after {
                width: calc(100% + 30px);
                margin-left: -15px;
            }

            .content {
                padding: 15px 0px;
            }

            #view-content,
            #timer-content {
                width: 90%;
                padding: 5px;
            }

            .content p {
                font-size: 13px;
                line-height: 18px;
            }
        }

        .spin {
            display: block;
            width: 80px;
            height: 80px;
            margin: 0 auto;
        }


        @keyframes spin {
            0% {
                transform: scale(0.5);
                opacity: 0;
                border-width: 8px;
            }

            20% {
                transform: scale(0.6);
                opacity: 0.8;
                border-width: 4px;
            }

            90% {
                transform: scale(1);
                opacity: 0;
            }
        }

        .spin div {
            width: 100%;
            height: 100%;
            vertical-align: middle;
            display: inline-block;
            border-radius: 50%;
            border: 4px solid #29b7d6;
            -webkit-animation: spin 1.3s linear infinite;
            animation: spin 1.3s linear infinite;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            opacity: 0;
            border-color: rgba(57, 100, 168, 1) !important;
        }

        @media screen and (min-width: 761px) {
            .no-desktop {
                display: none;
            }

            button {
                margin: 0px 8px;
            }

            .primary-button {
                min-width: 200px;
            }

            #view-content>div>div {
                padding: 15px 0px;
            }
        }

        @media screen and (max-width: 460px) {
            #app {
                width: 100%;
            }

            #view-content>div>div:last-child {
                padding-bottom: 15px;
                margin-top: -20px;
            }

            button {
                margin: 0px 5px;
            }

            #timer-content {
                width: 100%;
                max-width: 460px;
                position: fixed;
                bottom: 0px;
                font-size: 12px;
            }
        }
    </style>

    <meta name="theme-color" content="#2A70C8" />
</head>

<body>
    <div id="app">
        <div id="app-container">
            <div id="view-content">
                <div class="powered-by-header hide-sm">
                    <div class="powered-by">
                        <span>Powered by</span>
                        <img src="https://cdn.razorpay.com/logo.svg" alt="Razorpay" />
                    </div>
                </div>
                <span class="divider hide-sm"></span>
                <div>
                    <div>
                        <div class="title-card">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 71 71" width="60"
                                    height="60">
                                    <title>test-svg</title>
                                    <style>
                                        .s0 {
                                            fill: #f4f8ff;
                                        }

                                        .s1 {
                                            fill: #ffffff;
                                        }

                                        .s2 {
                                            fill: #1f2849;
                                        }

                                        .s3 {
                                            fill: #3395ff;
                                        }
                                    </style>
                                    <circle id="Layer" class="s0" cx="35.5" cy="35.5" r="35.5" />
                                    <path id="Layer" fill-rule="evenodd" class="s1"
                                        d="m63.8 56.9c-4.4 5.9-10.7 10.3-17.8 12.5-7.1 2.2-14.7 2.1-21.8-0.2-7-2.4-13.2-6.9-17.5-13-4.4-6-6.7-13.3-6.7-20.7q0-1.7 0.2-3.4c0.5-5.5 2.3-10.7 5.2-15.4 2.9-4.7 6.8-8.6 11.5-11.4 4.7-2.9 10-4.7 15.4-5.2 5.5-0.4 11 0.3 16.1 2.3 5.1 2 9.7 5.2 13.4 9.2 3.7 4.1 6.4 8.9 7.9 14.2 1.5 5.3 1.7 10.8 0.7 16.2-1 5.4-3.3 10.5-6.6 14.9zm-8.4-18.1v-18.3l-19.6-9.6h-0.1l-19.5 9.6v18.3c0 4.4 2.9 9.9 6.5 12.4l13.1 8.9 13.1-8.9c3.6-2.5 6.5-8 6.5-12.4z" />
                                    <path id="Layer" class="s2"
                                        d="m55.4 20.5v18.3c0 4.4-2.9 9.9-6.5 12.4l-13.1 8.9-0.1-49.2h0.1z" />
                                    <path id="Layer" class="s3"
                                        d="m35.7 10.9l0.1 49.2-13.1-8.9c-3.6-2.5-6.5-8-6.5-12.4v-18.3l19.5-9.6z" />
                                </svg>
                            </div>
                            <div class="title-text">
                                <div>Don't Move Away</div>
                            </div>
                        </div>
                        <div>
                            <div class="content">
                                <div class="spin">
                                    <div></div>
                                </div>

                                <p>
                                    Please don't move away while your device is detecting the
                                    UPI app
                                </p>
                            </div>
                            <div class="actions">
                                <div id="consentForm">
                                    <button id="goBack" class="secondary-button">
                                        Cancel &amp; go back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="powered-by no-desktop visible-sm" style="justify-content: center">
                        <span>Powered by</span>
                        <img src="https://cdn.razorpay.com/logo.svg" alt="Razorpay" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>

        function focusParent() {
            if(window.opener){
                window.opener.focus();
            }
            window.open('', 'rzpCheckout').focus();
        }


        var goBack = document.getElementById('goBack');
        goBack.addEventListener(
            'click',
            (e) => {

                focusParent();
                window.opener.${callBackName}('goBack', e);
            },
            { capture: true }
        );
        window.addEventListener('beforeunload', (e) => {
            focusParent();
            window.opener.${callBackName}('beforeunload', e, {
                capture: true,
            });
        });
        window.addEventListener('blur', (e) => {
            window.opener.${callBackName}('blur', e, {
                capture: true,
            });
        });
        window.addEventListener('focus', (e) => {
            window.opener.${callBackName}('focus', e, {
                capture: true,
            });
        });
    </script>
</body>

</html>`;
