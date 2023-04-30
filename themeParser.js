/* by @lasermtv,
made for the OpenBakalari project, a free client to Bakalari*/



function theme(json) {
const dyn=document.querySelector("#dyn")
/*
text1 - nadpisy
text2 - nazvy hintu (jako napr u Znamka: 5 je to Znamka)
text3 - hodnoty (napr u Znamka: 5 je to 5)
text4 - normalni text (napr u napovedy)

try {
    var theme=JSON.parse(json)

    var colors_backg=theme.colors.back
    var colors_inputs=theme.colors.inputs
    var colors_placeholder=theme.colors.greytext
    var colors_button=theme.colors.button
    var colors_buttontext=theme.colors.buttontext
    var colors_buttonhov=theme.colors.buttonhov
    var colors_border=theme.colors.borderc

    var colors_h1=theme.colors.text1
    var colors_hints=theme.colors.text2
    var colors_content=theme.colors.text3
    var colors_other=theme.colors.text4

    var round=theme.other.round
    var font=theme.other.font
    var border_size=theme.other.border


    dyn.innerHTML=`
        body {
        background-color: ${colors_backg};
        font-family: ${font};
    }
    h1 {
        color:${colors_h1};
    }
    .hints {
        color: ${colors_hints};
    }
    .content {
        color: ${colors_content};
    }
    .other {
        color: ${colors_other};
    }
    main form input[type=text],main form input[type=url], main form input[type=password]{
        background-color: ${colors_inputs};
        color: ${colors_placeholder};
    }
    input[type=submit], button {
        background-color: ${colors_button};
        color: ${colors_buttontext}
    }
    input[type=submit]:hover, button:hover {
        background-color: ${colors_buttonhov};
    }
    input {
        border: ${border_size}px solid ${colors_border};
        border-top-left-radius: ${round}px;
        border-top-right-radius: ${round}px;
        border-bottom-right-radius: ${round}px;
        border-bottom-left-radius: ${round}px;
        font-family: ${font};
      
    }`
}
catch {
    document.getElementById('errorstatus').innerText="Unable to parse theme JSON"
}

}
