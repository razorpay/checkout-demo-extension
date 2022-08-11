export default `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: #f5f5f5;
  overflow: hidden;
  text-align: center;
  height: 100%;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, ubuntu, verdana, helvetica,
    sans-serif;
}
#bg {
  position: absolute;
  bottom: 50%;
  width: 100%;
  height: 50%;
  margin-bottom: 90px;
}
#cntnt {
  position: relative;
  width: 100%;
  vertical-align: middle;
  display: inline-block;
  margin: auto;
  max-width: 420px;
  min-width: 280px;
  height: 95%;
  max-height: 360px;
  background: #fff;
  z-index: 9999;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  overflow: hidden;
  padding: 24px;
  text-align: left;
}
#ftr {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80px;
  background: #f5f5f5;
  text-align: center;
  color: #212121;
  font-size: 14px;
  letter-spacing: -0.3px;
}
#ftr.with-custom-img {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
#ldr {
  width: 100%;
  height: 3px;
  position: relative;
  margin-top: 16px;
  border-radius: 3px;
  overflow: hidden;
}
#ldr:before,
#ldr:after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
}
#ldr:after {
  width: 90%;
  animation: ldrbar 20s cubic-bezier(0, 0.1, 0, 1);
}
#ldr:before {
  width: 100%;
  top: 1px;
  border-top: 1px solid #bcbcbc;
}
@keyframes ldrbar {
  0% { width: 0%; }
  100% { width: 90%; }
}
#logo {
  width: 48px;
  height: 48px;
  padding: 8px;
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  text-align: center;
}
#hdr {
  min-height: 48px;
  position: relative;
}
#logo,
#name,
#amt {
  display: inline-block;
  vertical-align: middle;
  letter-spacing: -0.5px;
}
#amt {
  position: absolute;
  right: 0;
  top: 0;
  background: #fff;
  color: #212121;
}
#name {
  line-height: 48px;
  margin-left: 12px;
  font-size: 16px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #212121;
}
#logo + #name {
  line-height: 20px;
}
#txt {
  position: relative;
  height: 200px;
  text-align: center;
}
h2 {
  font-size: 20px;
  line-height: 24px;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
p{
  font-size: 14px;
  line-height: 20px;
  color: #757575;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.later {
  position: absolute;
  animation: appear 10s;
  transform: translate(-50%,-50%);
  top: 50%;
  left: 50%;
  width: 100%;
}
.initial {
  opacity: 0;
  animation: vanish 10s;
}
@keyframes appear {
  0% { opacity: 0; }
  98% { opacity: 0; }
}
@keyframes vanish {
  0% { opacity: 1; }
  98% { opacity: 1; }
}
#logo img {
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
}
@media (max-height: 580px), (max-width: 420px) {
  #bg {
    display: none;
  }
}
@media (max-width: 420px) {
  #cntnt {
    padding: 16px;
    width: 95%;
  }
  #name {
    margin-left: 8px;
  }
}
@media (max-width: 420px) {
  #ftr.with-custom-img {
    padding: 16px;
  }
}
`;
