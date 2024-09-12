// cycle in connections
// only thing that change from code does not trigger the user event
{
  /* <div>
Size:
<input
  type="number"
  id="sizeTextbox"
  value="10"
  min="1"
  max="50"
  maxlength="2"
/>
<input type="range" id="sizeSlider" value="10" min="1" max="50" />
</div> */
}
sizeTextbox.addEventListener("input", (event) => {
  // make the slider match the updated textbox
  sizeSlider.value = sizeTextbox.value;
  console.log("box changed, update slider");
});
sizeSlider.addEventListener("input", (event) => {
  // make the textbox match the updated slider
  sizeTextbox.value = sizeSlider.value;
  console.log("slider changed, update box");
});

// asynchronous countdown timer
function down(count) {
  console.log(count);
}

function timer(ticks, down) {
  if (ticks > 0) {
    setTimeout(() => timer(ticks - 1, down), 1000);
  }
  down(ticks);
}

timer(3, down);
