RazorpayLibs.templates.autosubmit = '<!doctype html>
<html>
    <head>
    </head>
    <body style="text-align: center; padding-top: 30px;">
        <form method = "POST" action = "{{=it.data.url}}" id = "rzp-dcform">
            <input type = "hidden" name = "PaReq" value = "{{=it.data.PAReq}}">
            <input type = "hidden" name = "MD" value = "{{=it.data.paymentid}}">
            <input type = "hidden" name = "TermUrl" value = "{{=it.callbackUrl}}">
            <input style = "display:none" type = "submit" value = "Submit">
        </form>
        Your request is being processed
        <script>
            var form = document.getElementById("rzp-dcform");
            form.submit();
        </script>
    </body>
</html>'
