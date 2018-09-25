<div>
    <input type="checkbox" id="custom-checkbox" bind:checked on:change="changeListener()">
    <label for="custom-checkbox">
        <span class="checkbox"></span>
        <span>
            <slot></slot>   
        </span>
    
    </label>
    
</div>

<script>
    export default {
        methods: {
            changeListener(e) {
                const { checked } = this.get();
                console.log("Checked = " + checked);
                this.fire("change", { "checked": checked });
            }
        },
        data() {
            return {
                checked: false
            };
        },
    }
</script>

<style>
    input[type=checkbox] {
        display: none;
        appearance: none;
    }

    label {
        display: inline-block;
        cursor: pointer;
        position: relative;
        padding-left: 2px;
    }

    label span{
        vertical-align: middle;
    }

    .checkbox{
        content: "";
        display: inline-block;
        width: 16px;
        height: 16px;
        position: relative;
        left: 0;
        border-radius: 3px;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
    }

    input[type=checkbox]:checked ~ label .checkbox{
        content: "";
        border-color: #1B5CAB;
        background-color: #1B5CAB;
    }

    input[type=checkbox]:checked ~ label .checkbox:before{
        content: "";
        position: relative;
        height: 10px;
        width: 4px;
        border: solid #fff;
        border-radius: 0 0 1px 0;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        top: 1px;
        margin-left: 5px;
        display: block;
    }


</style>

<!--<div id='checkbox-btn'>
    <span>
        <input type="checkbox" name="checkbox" id="checkbox" class="checkbox-square">
            <label for="checkbox">
                <div class="checkbox"></div>
            </label>
    </span>
</div>-->