export default function Redir(src, name, payment) {
  this.name = name;
  this.payment = payment;
  this.window = global;
  this.name = payment.r.get('target') || '_top';
}

Redir.prototype = {
  write: function(html) {
    if (this.writable) {
      global.document.write(html);
      global.document.close();
    }
  },

  show: _Func.noop,
  close: _Func.noop,
};
