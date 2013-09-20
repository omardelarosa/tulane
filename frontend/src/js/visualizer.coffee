###
# Fontana feed visualizer.
###

@Fontana ?= {}

messageTemplate = '<div id="{id}" class="message media well col-md-6 col-md-offset-3">
    <figure class="pull-left media-object">
        <img src="{user.profile_image_url}" width="64" height="64" alt="" class="avatar img-thumbnail">
    </figure>
    <div class="media-body">
        <div class="media-heading">
            <cite>
                <span class="name">{user.name}</span>
                <small class="text-muted">
                    <span class="screen_name">@{user.screen_name}</span>
                    <time class="time pull-right" data-time="{created_at}">{created_at}</time>
                </small>
            </cite>
        </div>
        <div class="text lead"><q>{text}</q></div>
    </div>
</div>'

transitionEffects = ['scroll-up', 'scroll-down', 'lightspeed', 'hinge']


class Fontana.Visualizer
    # Fontana visualizer, takes a container node and a datasource.
    constructor: (@container, @datasource) ->
        @paused = false
        @fetchMessagesTimer = -1
        @animationTimer = -1

    start: (settings)->
        @fetchMessages(true)
        @container.empty()
        @config(settings)
        @scheduleUpdateAllTimes()

    config: (settings)->
        transitionEffects.forEach (cls) =>
            @container.removeClass(cls)
        if settings && settings.transition && transitionEffects.indexOf(settings.transition) > -1
            @container.addClass(settings.transition)
        else
            @container.addClass('scroll-down')

    pause: ->
        if !@paused
            clearTimeout(@fetchMessagesTimer)
            clearTimeout(@animationTimer)
            @paused = true

    resume: ->
        if @paused
            @fetchMessages()
            @animate()
            @paused = false

    stop: ->
        @pause()
        @container.empty()

    # Messages
    fetchMessages: (initial=false)->
        @datasource.getMessages((data) =>
            @renderMessages(data, initial)
            @scheduleFetchMessages())

    renderMessages: (messages, initial=false)->
        messages.reverse().forEach((message)=>
            if !$("##{message.id}").length
                message.text = twttr.txt.autoLinkWithJSON(
                    message.text, message.entities, targetBlank: true)
                messageNode = $(nano(messageTemplate, message))
                @updateTime(messageNode)
                @container.prepend(messageNode))
        if initial
            @scheduleAnimation()

    animate: ->
        messages = $(".message", @container)
        if messages.length >= 3
            if !@current || !@current.next().length
                prev = $(".message:last", @container)
                @current = $(".message:first", @container)
                next = @current.next()
            else
                prev = @current
                @current = @current.next()
                if @current.next().length
                    next = @current.next()
                else
                    next = $(".message:first", @container)
        else if messages.length == 2
            if !@current || !@current.next().length
                @current = $(".message:first", @container)
                next = @current.next()
            else
                @current = @current.next()
                if @current.next().length
                    next = @current.next()
                else
                    next = $(".message:first", @container)
        else
            @current = messages
        messages.removeClass("focus").removeClass("prev")
        if prev
            prev.addClass("prev")
        @current.removeClass("next").addClass("focus")
        if next
            next.addClass("next")
        @scheduleAnimation()

    # Time display
    updateAllTimes: ->
        $(".message", @container).each((i, message)=>
            @updateTime(message))
        @scheduleUpdateAllTimes()

    updateTime: (message)->
        time = $(".time", message)
        time.text(Fontana.utils.prettyDate(time.data("time")))

    # Scheduling
    scheduleAnimation: ->
        delay = if @animationTimer == -1 then 0 else 6000
        @animationTimer = setTimeout((=> @animate()), delay)

    scheduleFetchMessages: ->
        @fetchMessagesTimer = setTimeout((=> @fetchMessages()), 30000)

    scheduleUpdateAllTimes: ->
        setTimeout((=> @updateAllTimes()), 10000)


@Fontana.Visualizer.transitionEffects = transitionEffects
