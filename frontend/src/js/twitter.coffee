class @TwitterAuth
    activeSession: (callback) ->
        $.get('/api/twitter/session/').success (data) ->
            callback(data)
        .error ->
            callback(null)
    signIn: (callback) ->
        funcName = String.fromCharCode(Math.floor(Math.random() * 24) + 65) + (new Date()).getTime()
        window[funcName] = callback
        width = 700
        height = 500
        left = window.screen.width / 2 - width / 2
        top = screen.height / 2 - height / 2
        windowFeatures = 'location=0,menubar=0,resizable=0,scrollbars=0,status=0,width=#{width},height=#{height},top=#{top},left=#{left}'
        window.open('/api/twitter/session/new/?next=/pop/twitter_success.html' + encodeURIComponent('?callback=' + funcName), windowFeatures)
    signOut: (callback) ->
        $.post('/api/session/clear/').success(callback)
