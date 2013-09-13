###
# Fontana feed visualizer.
###

@Fontana ?= {}

messageTemplate = '<div id="{id}" class="message media well col-md-6 col-md-offset-3">
    <figure class="pull-left media-object">
        <img src="{user.profile_image_url}" width="64" height="64" alt="" class="avatar img-thumbnail">
    </figure>
    <div class="media-body">
        <p class="media-heading">
            <cite>
                <span class="name">{user.name}</span>
                <small class="text-muted">
                    <span class="screen_name">@{user.screen_name}</span>
                    <time class="time pull-right" data-time="{created_at}">{created_at}</time>
                </small>
            </cite>
        </p>
        <p class="text lead"><q>{text}</q></p>
    </div>
</div>'


class @Fontana.Visualizer
    # Fontana visualizer, takes a container node and a datasource.
    constructor: (@container, @datasource) ->
        @fetchMessagesTimer = -1
        @animationTimer = -1

    start: ->
        @fetchMessages(true)
        @container.empty()
        @scheduleUpdateAllTimes()

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
        $(".message", @container).removeClass("focus").removeClass("prev")
        prev.addClass("prev")
        @current.removeClass("next").addClass("focus")
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
        delay = if @animationTimer == -1 then 0 else 5000
        @animationTimer = setTimeout((=> @animate()), delay)

    scheduleFetchMessages: ->
        @fetchMessagesTimer = setTimeout((=> @fetchMessages()), 30000)

    scheduleUpdateAllTimes: ->
        setTimeout((=> @updateAllTimes()), 10000)
