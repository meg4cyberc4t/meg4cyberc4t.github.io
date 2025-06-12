---
layout: base
---

<style>
    html, body {
        max-width: 720px
    }
</style>
<img src="./assets/images/me.jpeg" alt="Igor Molchanov" width="230" class="logo" />

# Igor Molchanov

### Software Engineer & Team Lead

Hello! I'm Igor, a mobile application developer specializing in Flutter.
I have a keen interest in microservices architecture, programming
language constructs, team building, and public speaking.

~~Currently based in Moscow (+3 UTC), I'm available to answer work-related
queries until midnight.~~

<p style="color: red" id="timer-subtitle">
    I was called to military service until July 10, 2025
    <script>
        const msInDay =  (24 * 60 * 60 * 1000);
        var differenceFromStart = Date.now() - new Date('07/10/2024');
        var percentFromStart = 100 / 365 * Math.abs(differenceFromStart / msInDay);
        var daysToTheEnd = ((new Date('07/10/2025') - Date.now()) /  msInDay).toFixed(0);
        var message = `(${percentFromStart < 100 ? percentFromStart.toFixed(2) : "100.00"}%, ${daysToTheEnd} days left).`;
        document.getElementById("timer-subtitle").innerHTML += percentFromStart > 100 ? "<br />See you soon..." : message;
    </script>
</p>


Feel free to explore my portfolio and reach out for collaborations or
speaking engagements.

<a href="setup.html">~~Work Setup~~</a>
<a> - </a>
<a href='{{ "/assets/cv.pdf" | relative_url }}'>~~Curriculum Vitae~~</a>

## Articles

<ol>    
    {% for article in site.posts %}
    <li>
        <article>
            <h4><a href="{{ article.url }}">{{ article.title }}</a> <text style="color: gray"><time datetime="{{ article.date | date: "%Y-%m-%d" }}">{{ article.date | date_to_long_string }}</time></text></h4>
        </article>
    </li>
    {% endfor %}
</ol>

## My latest developments

<ol>
    <li>
        <a href="https://ithub.ru/bulgakov">LXP IThub</a> - an educational
        platform for learning business-oriented methodology (<a
            href="https://apps.apple.com/us/app/lxp-ithub/id6469046355">App Store</a>,
        <a href="https://play.google.com/store/apps/details?id=com.ithub.newlxp">Google Play</a>,
        <a href="https://appgallery.huawei.com/#/app/C110186239">App Gallery</a>).
    </li>
    <li>
        <a href="https://pro.yandex.ru/ru-ru">Yandex Pro</a> - an application
        for taxi drivers and couriers, where they take orders, perform trips
        (<a href="https://apps.apple.com/ru/app/yandex-pro/id1496904594">App Store</a>,
        <a href="https://play.google.com/store/apps/details?id=ru.yandex.taximeter">Google Play</a>,
        <a href="https://apps.rustore.ru/app/ru.yandex.taximeter">RuStore</a>).
    </li>
    <li>
        LocalHub - A social network with a smart map, event creation and
        opinion publishing.
    </li>
    <p style="color: gray">Other NDA-signed projects</p>
</ol>

## Open Source Projects and Experiments

<ol>
    <li>
        <a href="https://pub.dev/packages/varioqub_configs">varioqub_configs</a>
        — Flutter plugin providing work with remote configs, experiments and
        A/B testing via Varioqub.
    </li>
    <li>
        <a href="https://github.com/meg4cyberc4t/web_template">web_template</a>
        — Custom template for creating a standalone PWA using Flutter.
    </li>
    <li>
        <a href="https://github.com/meg4cyberc4t/weight_control">Weight Control</a>
        — An appication to control your weight (Example building an
        application with a properly designed architecture).
    </li>
    <a href="https://github.com/meg4cyberc4t?tab=repositories">Other stuff</a>
</ol>
<p />


## Education

<ul>
    <li>
        <p>International Academy of Information Technologies "IThub" - Moscow, Russia. Information systems and programming. Diploma with honors. September 2020 - June 2024</p>
    </li>
    <li>
        <p>Professional retraining in International Academy of Information Technologies "IThub" - Moscow, Russia. ".NET Developer". September 2020 - June 2024</p>
    </li> 
    <li>
        <p>Yandex Mobile Development School - Moscow, Russia. Flutter. June 2022 - September 2022</p>
    </li>
</ul>

## Contacts

<ol>
    <li>
        <a href="https://github.com/meg4cyberc4t">Github</a>
    </li>
    <li>
        <a href="https://t.me/molchanovia">Telegram</a>
    </li>
    <li>
        <a href="https://t.me/meg4cyberc4t">Personal Telegram channel</a>
    </li>
    <li>
        <a href="https://pub.dev/publishers/molchanovia.dev/packages">Pub</a>
    </li>
</ol>
