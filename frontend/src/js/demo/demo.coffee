# Tying things together to make the demo page work
$ ->
    controls = $("#controls")
    signIn = $("#signin")
    signOut = $("#signout")
    auth = new Fontana.TwitterAuth()
    container = $(".fontana")
    visualizer = null

    $('.pause-resume', controls).click ->
        icon = $('.glyphicon', this)
        if visualizer.paused
            icon.removeClass('glyphicon-play')
            icon.addClass('glyphicon-pause')
            visualizer.resume()
        else
            icon.removeClass('glyphicon-pause')
            icon.addClass('glyphicon-play')
            visualizer.pause()

    $('.fullscreen', controls).click ->
        if Fontana.utils.isFullScreen()
            Fontana.utils.cancelFullScreen()
        else
            Fontana.utils.requestFullScreen(document.body)

    $('button', signIn).click ->
        auth.signIn(checkSession)
    $('button', signOut).click ->
        auth.signOut(checkSession)

    checkSession = ->
        auth.activeSession (data)->
            if (data)
                isSignedIn(data)
            else
                isSignedOut()

    isSignedIn = (data)->
        userText = $(".navbar-text", signOut)
        userText.html(nano(userText.data("text"), data))
        signIn.addClass("hidden")
        signOut.removeClass("hidden")
        twitterFontana()

    isSignedOut = ->
        signIn.removeClass("hidden")
        signOut.addClass("hidden")
        HTMLFontana()

    twitterFontana = ->
        datasource = new Fontana.datasources.TwitterSearch("#FridayThe13th")
        visualizer = new Fontana.Visualizer(container, datasource)
        visualizer.start()

    HTMLFontana = ->
        datasource = new Fontana.datasources.HTML(container)
        visualizer = new Fontana.Visualizer(container, datasource)
        visualizer.start()

    checkSession()
