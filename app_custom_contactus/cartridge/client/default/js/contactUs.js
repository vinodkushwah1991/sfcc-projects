$(document).ready(function () {
  // custom validation
  $(".showerror").hide();
  $(".showerrorMail").hide();
  $("#message").css("border-color", "none");
  $("#validatemessage").click(function(){
    $(".showerror").hide();
    $(".showerrorMail").hide();
    $("#message").css("border-color", "black");
    var textmessage = $("#message").val();
    var toMail = $("#tomail").val();
    // message validation
    if(textmessage.length === 0){
      $(".showerror").css("color", "#c00");
      $(".showerror").css("font-size", "13px");
      $("#message").css("border-color", "#c00");
      $(".showerror").show();
    }
    // mail validation
    if(toMail.length === 0){
      $(".showerrorMail").css("color", "#c00");
      $(".showerrorMail").css("font-size", "13px");
      $(".showerrorMail").show();
    }
  });


    function sendContactUs(form)
{
    var url = form.attr("action");
    $.ajax({
        url: url,
        type: 'POST',
        data: form.serialize(),
        success: function (response) {
            if (response.success == true) {
                $('#myModal').modal('toggle');
                $('#message').val('');
                $('#email').val('');
                $('#tomail').val('');
            }
            else {
              $('#myModalRecaptcha').modal('toggle');
            }
        },
        error: function (error) {
            console.log(error);
            alert('Please Try Again');
        }

    })
}

  $("#dwfrm_contactUs").on("submit", function (e) {

    
    e.preventDefault();
      var message = $("#message").val();
    if (message.length == 0) {
      $("#invalid-feedback-message").empty();
      $("#invalid-feedback-message").append(
        `<span class = "text-danger" >Please Enter value for Message </span>`
      );
    } else {
      const regax = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
      if (regax.test(message)) {
        $("#invalid-feedback-message").empty();
        $("#invalid-feedback-message").append(
          `<span class = "text-danger" >Special Characters are not allowed </span>`
        );
      } else {
        var form = $(this);
        var siteKey = $("#SiteKey").val();
        grecaptcha.ready(function () {
          grecaptcha
            .execute(siteKey, { action: "submit" })
            .then(function (token) {
              // Add your logic to submit to your backend server here.
              $("#CaptchaResponse").val(token);
              sendContactUs(form);
            });
        });
      }
    }
  });

  $(document).on("click", "#contactUs-btn", function () {
    var action = $(this);
    var url = action.attr("data-url");
    $.ajax({
      url: url,
      type: "GET",
      success: function (response) {
        console.log(response);
        if (response.success == true) {
          window.location.href = response.redirectURL;
        } else {
          alert("Something went wrong");
        }
      },
      error: function (error) {
        console.log(error);
        alert("Unable to process");
      },
    });
  });
});



