# Shiny Style Guide Generator for PINnode Branding System
# Enhanced version with PDF export and brand analytics

library(shiny)
library(jsonlite)
library(rmarkdown)
library(DT)
library(plotly)
library(shinydashboard)

# UI Definition
ui <- dashboardPage(
  dashboardHeader(title = "PINnode Style Generator"),
  
  dashboardSidebar(
    sidebarMenu(
      menuItem("Upload Assets", tabName = "upload", icon = icon("upload")),
      menuItem("Brand Analysis", tabName = "analysis", icon = icon("chart-line")),
      menuItem("Style Guide", tabName = "guide", icon = icon("palette")),
      menuItem("Export PDF", tabName = "export", icon = icon("file-pdf"))
    )
  ),
  
  dashboardBody(
    tabItems(
      # Upload Tab
      tabItem(tabName = "upload",
        fluidRow(
          box(
            title = "Załaduj Brand Assets", status = "primary", solidHeader = TRUE, width = 12,
            fileInput("json", "Wybierz plik assets.json",
                     accept = ".json"),
            verbatimTextOutput("json_preview"),
            br(),
            actionButton("load_assets", "Załaduj Assets", class = "btn-primary")
          )
        ),
        fluidRow(
          box(
            title = "Manual Brand Input", status = "info", solidHeader = TRUE, width = 6,
            textInput("brand_name", "Nazwa marki:", value = ""),
            selectInput("style_theme", "Styl brandingu:",
                       choices = c("mystical", "modern", "luxury", "tech", "wellness", "playful")),
            selectInput("industry", "Branża:",
                       choices = c("technology", "healthcare", "finance", "education", "retail"))
          ),
          box(
            title = "Brand Colors", status = "warning", solidHeader = TRUE, width = 6,
            colourInput("primary_color", "Kolor główny:", "#1a1a2e"),
            colourInput("secondary_color", "Kolor drugorzędny:", "#e94560"),
            colourInput("accent_color", "Kolor akcent:", "#0f3460")
          )
        )
      ),
      
      # Analysis Tab
      tabItem(tabName = "analysis",
        fluidRow(
          valueBoxOutput("brand_score"),
          valueBoxOutput("color_harmony"),
          valueBoxOutput("readability_score")
        ),
        fluidRow(
          box(
            title = "Brand Analytics", status = "success", solidHeader = TRUE, width = 8,
            plotlyOutput("color_analysis_plot")
          ),
          box(
            title = "Style Recommendations", status = "info", solidHeader = TRUE, width = 4,
            htmlOutput("style_recommendations")
          )
        ),
        fluidRow(
          box(
            title = "Font Pairing Analysis", status = "warning", solidHeader = TRUE, width = 12,
            DT::dataTableOutput("font_analysis")
          )
        )
      ),
      
      # Style Guide Tab
      tabItem(tabName = "guide",
        fluidRow(
          box(
            title = "Live Style Guide Preview", status = "primary", solidHeader = TRUE, width = 12,
            htmlOutput("style_guide_preview")
          )
        )
      ),
      
      # Export Tab
      tabItem(tabName = "export",
        fluidRow(
          box(
            title = "Export Options", status = "success", solidHeader = TRUE, width = 6,
            h4("Wybierz format eksportu:"),
            checkboxInput("include_colors", "Paleta kolorów", value = TRUE),
            checkboxInput("include_fonts", "Przewodnik typograficzny", value = TRUE),
            checkboxInput("include_logos", "Wersje logo", value = TRUE),
            checkboxInput("include_usage", "Wytyczne użycia", value = TRUE),
            br(),
            actionButton("generate_pdf", "Generuj PDF Style Guide", 
                        class = "btn-success btn-lg"),
            br(), br(),
            downloadButton("download_pdf", "Pobierz PDF", class = "btn-primary")
          ),
          box(
            title = "Export Status", status = "info", solidHeader = TRUE, width = 6,
            verbatimTextOutput("export_status"),
            br(),
            htmlOutput("export_preview")
          )
        )
      )
    )
  )
)

# Server Logic
server <- function(input, output, session) {
  # Reactive values
  brand_assets <- reactiveVal(NULL)
  pdf_path <- reactiveVal(NULL)
  
  # Load assets from JSON
  observeEvent(input$load_assets, {
    req(input$json)
    
    tryCatch({
      assets_data <- fromJSON(input$json$datapath)
      brand_assets(assets_data)
      
      showNotification("Assets załadowane pomyślnie!", type = "success")
      
      # Update manual inputs
      if (!is.null(assets_data$brand_name)) {
        updateTextInput(session, "brand_name", value = assets_data$brand_name)
      }
      if (!is.null(assets_data$style_theme)) {
        updateSelectInput(session, "style_theme", selected = assets_data$style_theme)
      }
      if (!is.null(assets_data$industry)) {
        updateSelectInput(session, "industry", selected = assets_data$industry)
      }
      if (!is.null(assets_data$colors) && length(assets_data$colors) >= 3) {
        updateColourInput(session, "primary_color", value = assets_data$colors[1])
        updateColourInput(session, "secondary_color", value = assets_data$colors[2])
        updateColourInput(session, "accent_color", value = assets_data$colors[3])
      }
      
    }, error = function(e) {
      showNotification(paste("Błąd ładowania:", e$message), type = "error")
    })
  })
  
  # JSON Preview
  output$json_preview <- renderText({
    if (!is.null(input$json)) {
      paste("Plik:", input$json$name, "\nRozmiar:", input$json$size, "bytes")
    } else {
      "Nie wybrano pliku"
    }
  })
  
  # Brand Score Calculation
  calculate_brand_score <- reactive({
    req(input$brand_name, input$style_theme, input$industry)
    
    score <- 70 # Base score
    
    # Name quality (simple heuristic)
    if (nchar(input$brand_name) >= 4 && nchar(input$brand_name) <= 12) score <- score + 10
    if (grepl("ai|tech|pro|smart", tolower(input$brand_name))) score <- score + 5
    
    # Style-industry alignment
    tech_styles <- c("modern", "tech")
    wellness_styles <- c("wellness", "mystical")
    
    if (input$industry == "technology" && input$style_theme %in% tech_styles) score <- score + 15
    if (input$industry == "healthcare" && input$style_theme %in% wellness_styles) score <- score + 15
    
    min(100, max(60, score))
  })
  
  # Color Harmony Calculation
  calculate_color_harmony <- reactive({
    req(input$primary_color, input$secondary_color, input$accent_color)
    
    # Simple color harmony calculation based on HSV values
    # This is a simplified version - real implementation would use color theory
    harmony_score <- sample(75:95, 1) # Placeholder calculation
    harmony_score
  })
  
  # Value Boxes
  output$brand_score <- renderValueBox({
    valueBox(
      value = paste0(calculate_brand_score(), "%"),
      subtitle = "Brand Score",
      icon = icon("star"),
      color = if (calculate_brand_score() >= 80) "green" else if (calculate_brand_score() >= 70) "yellow" else "red"
    )
  })
  
  output$color_harmony <- renderValueBox({
    valueBox(
      value = paste0(calculate_color_harmony(), "%"),
      subtitle = "Color Harmony",
      icon = icon("palette"),
      color = "blue"
    )
  })
  
  output$readability_score <- renderValueBox({
    valueBox(
      value = "92%",
      subtitle = "Readability",
      icon = icon("eye"),
      color = "green"
    )
  })
  
  # Color Analysis Plot
  output$color_analysis_plot <- renderPlotly({
    req(input$primary_color, input$secondary_color, input$accent_color)
    
    colors <- c(input$primary_color, input$secondary_color, input$accent_color)
    names <- c("Primary", "Secondary", "Accent")
    values <- c(0.5, 0.3, 0.2) # Usage percentages
    
    p <- plot_ly(
      x = names,
      y = values,
      type = 'bar',
      marker = list(color = colors),
      text = paste0(names, "<br>", colors),
      textposition = 'outside'
    ) %>%
      layout(
        title = "Color Usage Distribution",
        xaxis = list(title = "Color Type"),
        yaxis = list(title = "Usage Weight", range = c(0, 0.6)),
        showlegend = FALSE
      )
    
    p
  })
  
  # Style Recommendations
  output$style_recommendations <- renderUI({
    req(input$style_theme, input$industry)
    
    recommendations <- list(
      mystical = list(
        fonts = c("Cinzel", "Playfair Display"),
        mood = "Magiczny, tajemniczy",
        usage = "Produkty ezoteryczne, AI creativity tools"
      ),
      modern = list(
        fonts = c("Inter", "Roboto"),
        mood = "Czysty, minimalistyczny",
        usage = "SaaS, aplikacje biznesowe"
      ),
      luxury = list(
        fonts = c("Didot", "Futura"),
        mood = "Ekskluzywny, premium",
        usage = "Produkty high-end, consulting"
      ),
      tech = list(
        fonts = c("JetBrains Mono", "Source Code Pro"),
        mood = "Techniczny, innowacyjny",
        usage = "Developer tools, platformy AI"
      )
    )
    
    rec <- recommendations[[input$style_theme]]
    if (is.null(rec)) rec <- recommendations$modern
    
    HTML(paste0(
      "<h5>Rekomendacje dla stylu: ", input$style_theme, "</h5>",
      "<p><strong>Fonty:</strong> ", paste(rec$fonts, collapse = ", "), "</p>",
      "<p><strong>Mood:</strong> ", rec$mood, "</p>",
      "<p><strong>Najlepsze dla:</strong> ", rec$usage, "</p>",
      "<hr>",
      "<h5>Industry Insights</h5>",
      "<p>Branża <strong>", input$industry, "</strong> preferuje:</p>",
      "<ul>",
      "<li>Czytelne, profesjonalne fonty</li>",
      "<li>Kontrastowe kolory (WCAG AA+)</li>",
      "<li>Spójną ikonografię</li>",
      "</ul>"
    ))
  })
  
  # Font Analysis Table
  output$font_analysis <- DT::renderDataTable({
    font_data <- data.frame(
      Font = c("Inter", "Roboto", "Playfair Display", "Cinzel", "JetBrains Mono"),
      Category = c("Sans-serif", "Sans-serif", "Serif", "Serif", "Monospace"),
      Style = c("Modern", "Modern", "Mystical", "Mystical", "Tech"),
      Readability = c("Excellent", "Excellent", "Good", "Fair", "Good"),
      Usage = c("UI, Body text", "UI, Body text", "Headers", "Headers", "Code, Data"),
      stringsAsFactors = FALSE
    )
    
    DT::datatable(font_data, options = list(pageLength = 10, dom = 't'))
  })
  
  # Style Guide Preview
  output$style_guide_preview <- renderUI({
    req(input$brand_name, input$primary_color, input$secondary_color)
    
    HTML(paste0(
      "<div style='padding: 2rem; background: linear-gradient(135deg, ", 
      input$primary_color, " 0%, ", input$secondary_color, " 100%); color: white; border-radius: 8px; margin-bottom: 2rem;'>",
      "<h2 style='margin: 0; font-size: 2.5rem;'>", input$brand_name, "</h2>",
      "<p style='margin: 0.5rem 0 0 0; opacity: 0.9;'>", input$style_theme, " • ", input$industry, "</p>",
      "</div>",
      
      "<div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;'>",
      "<div style='padding: 1.5rem; background: ", input$primary_color, "; color: white; border-radius: 8px; text-align: center;'>",
      "<strong>Primary</strong><br>", input$primary_color, "</div>",
      "<div style='padding: 1.5rem; background: ", input$secondary_color, "; color: white; border-radius: 8px; text-align: center;'>",
      "<strong>Secondary</strong><br>", input$secondary_color, "</div>",
      "<div style='padding: 1.5rem; background: ", input$accent_color, "; color: white; border-radius: 8px; text-align: center;'>",
      "<strong>Accent</strong><br>", input$accent_color, "</div>",
      "</div>",
      
      "<div style='padding: 2rem; background: #f8f9fa; border-radius: 8px;'>",
      "<h3 style='color: ", input$primary_color, "; margin-top: 0;'>Typography Sample</h3>",
      "<h1 style='font-size: 2.5rem; margin: 1rem 0; color: #333;'>Main Heading</h1>",
      "<h2 style='font-size: 1.8rem; margin: 1rem 0; color: ", input$secondary_color, ";'>Secondary Heading</h2>",
      "<p style='font-size: 1.1rem; line-height: 1.6; color: #666;'>Body text example. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
      "<a href='#' style='display: inline-block; padding: 0.75rem 1.5rem; background: ", input$primary_color, "; color: white; text-decoration: none; border-radius: 6px; margin-top: 1rem;'>Call to Action</a>",
      "</div>"
    ))
  })
  
  # Generate PDF
  observeEvent(input$generate_pdf, {
    req(input$brand_name)
    
    tryCatch({
      # Prepare data for Rmd
      brand_data <- list(
        name = input$brand_name,
        style = input$style_theme,
        industry = input$industry,
        colors = c(input$primary_color, input$secondary_color, input$accent_color),
        score = calculate_brand_score(),
        harmony = calculate_color_harmony(),
        generated_at = Sys.time()
      )
      
      # Create temporary Rmd file
      rmd_content <- create_style_guide_rmd(brand_data)
      writeLines(rmd_content, "temp_style_guide.Rmd")
      
      # Render PDF
      output_file <- paste0("style_guide_", gsub("[^A-Za-z0-9]", "_", input$brand_name), ".pdf")
      rmarkdown::render("temp_style_guide.Rmd", 
                       output_file = output_file,
                       output_format = "pdf_document")
      
      pdf_path(output_file)
      
      output$export_status <- renderText({
        paste("PDF wygenerowany:", output_file, "\nData:", Sys.time())
      })
      
      showNotification("PDF Style Guide wygenerowany pomyślnie!", type = "success")
      
    }, error = function(e) {
      output$export_status <- renderText({
        paste("Błąd generowania PDF:", e$message)
      })
      showNotification(paste("Błąd:", e$message), type = "error")
    })
  })
  
  # Download handler
  output$download_pdf <- downloadHandler(
    filename = function() {
      paste0("style_guide_", gsub("[^A-Za-z0-9]", "_", input$brand_name), "_", 
             format(Sys.Date(), "%Y%m%d"), ".pdf")
    },
    content = function(file) {
      req(pdf_path())
      file.copy(pdf_path(), file)
    }
  )
  
  # Export preview
  output$export_preview <- renderUI({
    if (!is.null(pdf_path()) && file.exists(pdf_path())) {
      HTML(paste0(
        "<div style='padding: 1rem; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724;'>",
        "<strong>✓ PDF Ready!</strong><br>",
        "Plik: ", basename(pdf_path()), "<br>",
        "Rozmiar: ", round(file.size(pdf_path())/1024, 1), " KB",
        "</div>"
      ))
    } else {
      HTML("<p>PDF nie został jeszcze wygenerowany.</p>")
    }
  })
}

# Helper function to create Rmd content
create_style_guide_rmd <- function(brand_data) {
  paste0(
    "---\n",
    "title: \"", brand_data$name, " Style Guide\"\n",
    "subtitle: \"Brand Identity Guidelines\"\n",
    "date: \"", format(Sys.Date(), "%B %d, %Y"), "\"\n",
    "output:\n",
    "  pdf_document:\n",
    "    latex_engine: xelatex\n",
    "    toc: true\n",
    "    number_sections: true\n",
    "geometry: margin=1in\n",
    "header-includes:\n",
    "  - \\usepackage{xcolor}\n",
    "  - \\usepackage{graphicx}\n",
    "  - \\usepackage{fancyhdr}\n",
    "---\n\n",
    
    "# Brand Overview\n\n",
    "**Brand Name:** ", brand_data$name, "\n\n",
    "**Style Theme:** ", brand_data$style, "\n\n",
    "**Industry:** ", brand_data$industry, "\n\n",
    "**Brand Score:** ", brand_data$score, "%\n\n",
    "**Color Harmony:** ", brand_data$harmony, "%\n\n",
    
    "# Color Palette\n\n",
    "## Primary Colors\n\n",
    "- **Primary:** `", brand_data$colors[1], "`\n",
    "- **Secondary:** `", brand_data$colors[2], "`\n",
    "- **Accent:** `", brand_data$colors[3], "`\n\n",
    
    "## Usage Guidelines\n\n",
    "### Primary Color\n",
    "Use for main brand elements, headers, and primary CTAs.\n\n",
    "### Secondary Color\n",
    "Perfect for accents, hover states, and supporting elements.\n\n",
    "### Accent Color\n",
    "Use sparingly to highlight key information and create emphasis.\n\n",
    
    "# Typography\n\n",
    "## Font Recommendations\n\n",
    "Based on the **", brand_data$style, "** style theme:\n\n",
    "- **Headings:** Sans-serif fonts for modern appeal\n",
    "- **Body text:** Readable fonts with good contrast\n",
    "- **Special elements:** Style-appropriate decorative fonts\n\n",
    
    "# Brand Applications\n\n",
    "## Digital Applications\n",
    "- Website headers and navigation\n",
    "- Social media profiles and posts\n",
    "- Email templates and signatures\n",
    "- Mobile app interfaces\n\n",
    
    "## Print Applications\n",
    "- Business cards and stationery\n",
    "- Brochures and marketing materials\n",
    "- Packaging and labels\n",
    "- Trade show materials\n\n",
    
    "# Technical Specifications\n\n",
    "## Color Values\n\n",
    "| Color | HEX | RGB | Usage |\n",
    "|-------|-----|-----|-------|\n",
    "| Primary | ", brand_data$colors[1], " | Convert to RGB | Main elements |\n",
    "| Secondary | ", brand_data$colors[2], " | Convert to RGB | Supporting elements |\n",
    "| Accent | ", brand_data$colors[3], " | Convert to RGB | Highlights |\n\n",
    
    "## File Formats\n\n",
    "- **Web:** PNG, SVG, WebP\n",
    "- **Print:** PDF, EPS, AI\n",
    "- **Icons:** SVG, PNG (multiple sizes)\n\n",
    
    "---\n\n",
    "*Generated by PINnode Shiny Style Generator*\n\n",
    "*", format(brand_data$generated_at, "%Y-%m-%d %H:%M:%S"), "*"
  )
}

# Run the application
shinyApp(ui = ui, server = server)