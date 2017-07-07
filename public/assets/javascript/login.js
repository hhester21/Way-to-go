$(document).ready(function(){
    /***************************
     *****   SLIDER CODE   *****
     ***************************/
    if ($('#jssor_1').length) {
        var jssor_1_options = {
            $AutoPlay: 1,
            $Idle: 0,
            $SlideDuration: 5000,
            $SlideEasing: $Jease$.$Linear,
            $PauseOnHover: 4,
            $SlideWidth: 140,
            $Cols: 7
        };

        var jssor_1_slider = new $JssorSlider$("jssor_1", jssor_1_options);
        /*responsive code begin*/
        /*remove responsive code if you don't want the slider scales while window resizing*/
        function ScaleSlider() {
            var refSize = jssor_1_slider.$Elmt.parentNode.clientWidth;
            if (refSize) {
                refSize = Math.min(refSize, 980);
                jssor_1_slider.$ScaleWidth(refSize);
            }
            else {
                window.setTimeout(ScaleSlider, 30);
            }
        }

        ScaleSlider();
        $(window).bind("load", ScaleSlider);
        $(window).bind("resize", ScaleSlider);
        $(window).bind("orientationchange", ScaleSlider);
      /*responsive code end*/
    }

    /****************************
     *****  EVENT HANDLERS  *****
     ****************************/
    // login modal
    $("#login-button").click(function(){
        $("#login-modal").modal();
    });

    // register modal
    $("#register-button").click(function(){
        $("#register-modal").modal();
    });

    // login modal submit
    $("#login-button-submit").click(function(e) {
        $("#login-modal").modal('toggle');
    });

    // register modal submit
    $("#register-button-submit").click(function(e) {
        $("#register-modal").modal('toggle');
    });

    // wishes dynamic form. Adding and removing fields
    $(document).on('click', '.btn-add', function(e)
    {
        e.preventDefault();
        var currentEntry = $(this).parents('.entry:first');
        if (currentEntry.find('input').val() !== '') {
            var controlForm = $('.controls form:first #inputs-div');
            var newEntry = $(currentEntry.clone()).appendTo(controlForm);

            newEntry.find('input').val('');
            controlForm.find('.entry:not(:last) .btn-add')
                .removeClass('btn-add').addClass('btn-remove')
                .removeClass('btn-success').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
        }
    }).on('click', '.btn-remove', function(e)
    {
        $(this).parents('.entry:first').remove();

        e.preventDefault();
        return false;
    });

});