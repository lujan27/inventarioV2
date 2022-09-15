// Script remove spaces on username label

$("#userinput").keyup(function(){ 
    var ta = $("#userinput"); 
    letras = ta.val().replace(/ /g, ""); 
    ta.val(letras);
})