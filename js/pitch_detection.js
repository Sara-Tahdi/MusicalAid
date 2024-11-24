
var intervalId;
var button_toggle = false;

//Is called when button is pressed
function toggle_note_detection(){

  //know state of button
  button_toggle = !button_toggle;
  //Get the toggle button element
  var toggle_button = document.getElementById("init");

  //enable/disable script running in backround and change button's text
  if (button_toggle) {
    intervalId = setInterval(display_note, 20);
    toggle_button.innerText = "Stop"
  }
  if (!button_toggle) {
    clearInterval(intervalId);
    toggle_button.innerText = "Start"
  }
}



function display_note(){
 
    //Remember which notes were played for music sheet
    var detectedNotes = [];
    //Notes to be detected
    var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    //Getting audio and access to mic stuf
    var source;
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = audioContext.createAnalyser();
    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    if (!navigator?.mediaDevices?.getUserMedia) {
        alert('Sorry, getUserMedia is required for the app.')
        return;
    } 
    else { 
        var constraints = {audio: true};
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            
// ----------------------ACTUAL START OF THE LOGIC--------------------------------------
            
            //get audio data and analyze it
            var bufferLength = analyser.fftSize;
            var buffer = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(buffer);
            var autoCorrelateValue = autoCorrelate(buffer, audioContext.sampleRate)

            console.log(buffer)
            //If too quiet, don't show and don't store 
            if (autoCorrelateValue === -1) {
                document.getElementById('note').innerText = 'Too quiet...';
                return;
            }
               
          
            //If loud enough:
            //Convert frequency to note
            valueToDisplay = noteStrings[noteFromPitch(autoCorrelateValue) % 12];
            //Store in the array
            detectedNotes.push(valueToDisplay);
            
        })   }
}






//Copy pasted
function noteFromPitch( frequency ) {
    var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
    return Math.round( noteNum ) + 69;
}
//Copy pasted
function autoCorrelate(buffer, sampleRate) {
    
    // Perform a quick root-mean-square to see if we have enough signal
    var SIZE = buffer.length;
    var sumOfSquares = 0;
    for (var i = 0; i < SIZE; i++) {
      var val = buffer[i];
      sumOfSquares += val * val;
    }
    var rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
    if (rootMeanSquare < 0.01) {
      return -1;
    }
  
    // Find a range in the buffer where the values are below a given threshold.
    var r1 = 0;
    var r2 = SIZE - 1;
    var threshold = 0.2;
  
    // Walk up for r1
    for (var i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
  
    // Walk down for r2
    for (var i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }
  
    // Trim the buffer to these ranges and update SIZE.
    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length
  
    // Create a new array of the sums of offsets to do the autocorrelation
    var c = new Array(SIZE).fill(0);
    // For each potential offset, calculate the sum of each buffer value times its offset value
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j+i]
      }
    }
  
    // Find the last index where that value is greater than the next one (the dip)
    var d = 0;
    while (c[d] > c[d+1]) {
      d++;
    }
  
    // Iterate from that index through the end and find the maximum sum
    var maxValue = -1;
    var maxIndex = -1;
    for (var i = d; i < SIZE; i++) {
      if (c[i] > maxValue) {
        maxValue = c[i];
        maxIndex = i;
      }
    }
  
    var T0 = maxIndex;
  
    // Not as sure about this part, don't @ me
    // From the original author:
    // interpolation is parabolic interpolation. It helps with precision. We suppose that a parabola pass through the
    // three points that comprise the peak. 'a' and 'b' are the unknowns from the linear equation system and b/(2a) is
    // the "error" in the abscissa. Well x1,x2,x3 should be y1,y2,y3 because they are the ordinates.
    var x1 = c[T0 - 1];
    var x2 = c[T0];
    var x3 = c[T0 + 1]
  
    var a = (x1 + x3 - 2 * x2) / 2;
    var b = (x3 - x1) / 2
    if (a) {
      T0 = T0 - b / (2 * a);
    }
    
    return sampleRate/T0;
  }
  
  
  