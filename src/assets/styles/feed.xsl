<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>
          <xsl:value-of select="/rss/channel/title" />
        </title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="stylesheet" href="/assets/styles/index.css" type="text/css" />
      </head>
      <body class="feed">
        <div class="main-wrapper">
          <main>
            <section class="main-title">
              <h1>
                <a href="/feeds" tabindex="0">
                  <xsl:value-of select="/rss/channel/title" />
                </a>
              </h1>
            </section>
            <div class="default-wrapper">
              <p>
                <xsl:value-of select="/rss/channel/description" />
              </p>
              <p>
                <strong class="highlight-text">Subscribe by adding the URL below to your feed reader
                  of choice.</strong>
              </p>
              <p>
                <pre class="small">
                  <code><xsl:value-of select="rss/channel/atom:link/@href"/></code>
                </pre>
              </p>
              <p>
                <a href="/feeds">View more of the feeds from my site.</a>
              </p>
              <hr />
              <section>
                <xsl:for-each select="/rss/channel/item">
                  <div class="item">
                    <p class="date">Published: <xsl:value-of select="pubDate" /></p>
                    <h3>
                      <a>
                        <xsl:attribute name="href">
                          <xsl:value-of select="link" />
                        </xsl:attribute>
                        <xsl:value-of select="title" />
                      </a>
                    </h3>
                    <xsl:value-of select="description" disable-output-escaping="yes" />
                    <xsl:if test="enclosure">
                      <img src="{enclosure/@url}" alt="{title}" />
                    </xsl:if>
                  </div>
                </xsl:for-each>
              </section>
            </div>
          </main>
          <footer>
            <hr />
            <p>Subscribe by adding <code>
                <xsl:value-of select="rss/channel/atom:link/@href" />
              </code> to your
              feed reader of choice.</p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>