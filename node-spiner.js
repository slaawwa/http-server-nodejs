var twirlTimer = (function() {
  var P = ["\\", "|", "/", "-"];
  // var P = ['⠂', '-', '–', '—', '–', '-'];
  // var P = '⠁⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈⠈';
  var x = 0;
  return setInterval(function() {
    process.stdout.write("\r" + P[x++]);
    // console.log(' -> x:', x);
    x &= 3;
  }, 250);
})();
// setTimeout(() => {

//     // NOTE: Need for testing
//     // console.log('-');
//     // console.log('-');
//     // console.log('-');
//     // console.log('-');
//     // console.log('-');
//     console.log(' -> process.stdout.rows:', process.stdout.rows);
//     // console.log(' -> process.stdout:', Object.keys(process.stdout));
//     // console.log(' -> process.stdout.rows:', Object.keys(process.stdout.rows));

//     clearInterval(twirlTimer);

// }, 5000)
// var waitInterval = 500;
// var totalTime = 5000;
// var currentInterval = 0;

// function showPercentage(percentage){
//     // process.stdout.clearLine();
//     // console.log(`Processing ${percentage}%...` ); //replace this line with process.stdout.write(`Processing ${percentage}%...`);
//     process.stdout.write(`Processing ${percentage}%...` ); //replace this line with process.stdout.write(`Processing ${percentage}%...`);
//     process.stdout.cursorTo(1);
// }

// var interval = setInterval(function(){
//  currentInterval += waitInterval;
//  showPercentage((currentInterval/totalTime) * 100);
// }, waitInterval);

// setTimeout(function(){
//  clearInterval(interval);
// }, totalTime);
