function formatLabel(str, maxWidth){
    var sections = [];
    var words = str.split(" ");
    var section = ""
    words.forEach((word, idx) => {
      if (word.length > maxWidth) {
          word = word.splice(0, maxwidth-3) + '...'
      }
      if (section.length + word.length > maxWidth) {
        sections.push(section)
        section = word
      } else if (idx === words.length - 1) {
        sections.push(section + " " + word)
      } else {
        section = section + " " + word
      }
    })
    return sections;
  }

  console.log(formatLabel(`If you ever dealt with Redux or any state management framework. You will know immutability is super important. Let me briefly explain. An immutable object is an object where the state can't be modified after it is created.`, 50))
