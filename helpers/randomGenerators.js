

module.exports = {
  // Generate a uuid with uuid() - Do not ask how
  uuid: (a,b) => { for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b },

  // Generate a random integer in between min and max (borders included)
  randomIntBetween: (min,max) => { return Math.floor(Math.random()*(max-min+1)+min); },

  // Generate a random string of alphanumerics of XX chars
  randomStringOfLength: (chars) => { return Math.random().toString(36).substring(2, chars + 2).toUpperCase() }
}
