<div class="methods-loader">
  <div class="box"></div>
  <div class="line"></div>
  <div class="circle"></div>
</div>


<style>
  .methods-loader {
    position: relative;

    .box, .line, .circle {
      top:0;
      position: absolute;
      background-image: linear-gradient(to right,
        #cecece 0%,
        #ffffff 25%,
        #cecece 50%
      );
      background-size: 344px 18px;
      animation-duration: 1.8s;
      animation-fill-mode: forwards;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }

    .box {
      left: 0;
      width: 18px;
      height: @width;
      animation-name: methodsLoaderBox;
    }

    .line {
      left: 34px;
      top: 5px;
      width: 138px;
      height: 8px;
      animation-name: methodsLoaderBox;
    }

    .circle {
      right: 0;
      top: 1px;
      width: 18px;
      height: 16px;
      border-radius: 10px;
      animation-name: methodsLoaderBox;
    }
  }

</style>