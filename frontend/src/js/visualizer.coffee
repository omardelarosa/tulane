###
# Fontana feed visualizer.
###

@Fontana ?= {}

messageTemplate = '<div id="{id}" class="message media well">
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

    start: ->
        @fetchMessages()
        @container.empty()
        @scheduleUpdateAllTimes()

    # Messages
    fetchMessages: ->
        @datasource.getMessages((data) =>
            @renderMessages(data)
            @scheduleFetchMessages())

    renderMessages: (messages) ->
        messages.reverse().forEach((message)=>
            if !$("##{message.id}").length
                message.text = twttr.txt.autoLinkWithJSON(
                    message.text, message.entities, targetBlank: true)
                messageNode = $(nano(messageTemplate, message))
                @updateTime(messageNode)
                @container.prepend(messageNode))

    # Time display
    updateAllTimes: ->
        $(".message", @container).each((i, message)=>
            @updateTime(message))
        @scheduleUpdateAllTimes()

    updateTime: (message)->
        time = $(".time", message)
        time.text(Fontana.utils.prettyDate(time.data("time")))

    # Scheduling
    scheduleFetchMessages: ->
        @fetchMessagesTimer = setTimeout((=> @fetchMessages()), 30000)

    scheduleUpdateAllTimes: ->
        setTimeout((=> @updateAllTimes()), 10000)
