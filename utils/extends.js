String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.empty = function() {
  return this.length == 0;
}

Array.prototype.empty = function() {
  return this.length == 0;
}
