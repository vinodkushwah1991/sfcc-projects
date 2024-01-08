var dataId = ($('.product-option').attr("data-option-id"));
$(".options-select").prop("disabled", true);
$(document).on('change', '.options-select', function () {
    var optionDataValue = $(this).find(':selected').attr('data-value-id')
    if((dataId == "vEngravingOption") ){
        $("#engravingDetails").empty();
        $("#errorMsg").empty(); 
        if(optionDataValue != "WithoutEngraving"){
           
            setTimeout(function() { $('.add-to-cart').attr('disabled', true); }, 400);
        $("#engravingDetails").html("<textarea id='engravingMsg' cols='40' rows='3' maxlength='50' placeholder='Please Your Message'></textarea>");
    }}
});

$(document).on('change', '.select-engravingSize', function () {
    var optionDataSize = $(this).find('option:selected').attr('data-attr-value')
    if (optionDataSize == "undefined") {
        $(".options-select").prop("disabled", false);
    }else{
        $(".options-select").prop("disabled", true);
    }
    $("#engravingDetails").empty(); 
    $("#errorMsg").empty(); 
   
});

var minLength = 5;
var maxLength = 10;


$(document).on('keydown keyup change', '#engravingMsg', function () {
        var char = $(this).val();
        var spaceCheck =  char.replace(/ /g, "");
        var charLength = spaceCheck.length;
        if(charLength < minLength){
            $('#errorMsg').html('Length is not valid, minimum '+minLength+' allowed.');
            $(".add-to-cart").prop("disabled", true);
            $("#errorMsg").addClass("errorColor");
            $("#errorMsg").removeClass("successColor");
        }else if(charLength > maxLength){
            $('#errorMsg').text('Length is not valid, maximum '+maxLength+' allowed.');
            $(this).val(char.substring(0, maxLength));
            $(".add-to-cart").prop("disabled", true);
            $("#errorMsg").addClass("errorColor");
            $("#errorMsg").removeClass("successColor");
        }else{
            $('#errorMsg').text('Length is valid');
            $(".add-to-cart").prop("disabled", false);
            $("#errorMsg").addClass("successColor");
        }
    });
    


//update modal script 
var hiddenval
$(document).on('click', '.product-edit a', function () {
setTimeout(
    function() {
        var eoptionDataValue = $(".product-option").find(':selected').attr('data-value-id')
        if(eoptionDataValue  != "WithEngraving"){
            $("#editengravingEdit").empty(); 
        }        
    },
    3000);
});

$(document).on('change', '.options-select', function () {
    hiddenval = $(".hiddenval").val();
    console.log(hiddenval)
    var edataId = ($('.product-option').attr("data-option-id"));
    var optionDataValue = $(this).find(':selected').attr('data-value-id')
    if((edataId == "vEngravingOption") ){
        $("#editengravingEdit").empty();
        $("#errorMsg").empty(); 
        $(".cart-and-ipay").show();
        if(optionDataValue != "WithoutEngraving"){
            console.log("sssssssss")
        $(".cart-and-ipay").hide();
        $("#editengravingEdit").html("<textarea id='editengraving' cols='40' rows='3' maxlength='50' placeholder='Please Your Message'></textarea>");
        $("#editengravingEdit").val(hiddenval);
    }}
});


var eminLength = 5;
var emaxLength = 10;
$(document).on('keydown keyup change', '#editengraving', function () {
    var echar = $(this).val();
    console.log(echar,'echar')
    var espaceCheck =  echar.replace(/ /g, "");
    var echarLength = espaceCheck.length;
    if(echarLength < eminLength){
        $('#errorMsg').html('Length is not valid, minimum '+eminLength+' allowed.');
        $(".update-cart-product-global").prop("disabled", true);
        $("#errorMsg").addClass("errorColor");
        $("#errorMsg").removeClass("successColor");
        $(".quick-view-dialog .cart-and-ipay").show();
    }else if(echarLength > emaxLength){
        $('#errorMsg').text('Length is not valid, maximum '+emaxLength+' allowed.');
        $(this).val(echar.substring(0, emaxLength));
        $(".update-cart-product-global").prop("disabled", true);
        $("#errorMsg").addClass("errorColor");
        $("#errorMsg").removeClass("successColor");
        $(".quick-view-dialog .cart-and-ipay").show();
    }else{
        $('#errorMsg').text('Length is valid');
        $(".update-cart-product-global").prop("disabled", false);
        $("#errorMsg").addClass("successColor");
        $(".quick-view-dialog .cart-and-ipay").show();
    }
});