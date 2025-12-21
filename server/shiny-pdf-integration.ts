import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface ShinyPDFOptions {
  assetsData: any;
  outputPath: string;
  templateType?: 'style-guide' | 'brand-book' | 'quick-guide';
}

export async function generatePDFWithShiny(options: ShinyPDFOptions): Promise<Buffer> {
  try {
    // Create temporary directory for Shiny processing
    const tempDir = path.join(process.cwd(), 'temp_pdf_generation');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write assets data to temporary JSON file
    const assetsPath = path.join(tempDir, 'assets.json');
    await fs.writeFile(assetsPath, JSON.stringify(options.assetsData, null, 2));
    
    // Create R script for PDF generation
    const rScript = createRScript(assetsPath, options.outputPath, options.templateType);
    const rScriptPath = path.join(tempDir, 'generate_pdf.R');
    await fs.writeFile(rScriptPath, rScript);
    
    // Execute R script to generate PDF
    console.log('Generating PDF with R/Shiny...');
    const { stdout, stderr } = await execAsync(`Rscript "${rScriptPath}"`, {
      cwd: tempDir,
      timeout: 30000 // 30 second timeout
    });
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('R script error:', stderr);
      throw new Error(`PDF generation failed: ${stderr}`);
    }
    
    // Read generated PDF
    const pdfBuffer = await fs.readFile(options.outputPath);
    
    // Cleanup temporary files
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log('PDF generated successfully:', options.outputPath);
    return pdfBuffer;
    
  } catch (error) {
    console.error('Shiny PDF generation error:', error);
    // Return fallback HTML-to-PDF conversion
    return await generateFallbackPDF(options.assetsData);
  }
}

function createRScript(assetsPath: string, outputPath: string, templateType: string = 'style-guide'): string {
  return `
# Load required libraries
suppressMessages({
  library(jsonlite)
  library(rmarkdown)
  library(knitr)
  library(htmltools)
  library(webshot)
  library(pagedown)
})

# Read assets data
cat("Reading assets data...\\n")
assets <- fromJSON("${assetsPath}")

# Create HTML template for PDF
create_style_guide_html <- function(assets) {
  html_content <- paste0('
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>', assets$brandName, ' - Style Guide</title>
    <style>
        @page { margin: 20mm; size: A4; }
        body { 
            font-family: "Helvetica", Arial, sans-serif; 
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid ', assets$colors$primary, ';
            padding-bottom: 20px;
        }
        .brand-name {
            font-size: 28pt;
            color: ', assets$colors$primary, ';
            margin: 0;
            font-weight: bold;
        }
        .subtitle {
            font-size: 14pt;
            color: #666;
            margin: 10px 0;
        }
        .section {
            margin: 25px 0;
            page-break-inside: avoid;
        }
        .section h2 {
            color: ', assets$colors$primary, ';
            font-size: 16pt;
            border-bottom: 1px solid ', assets$colors$secondary, ';
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .color-palette {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 15px 0;
        }
        .color-item {
            text-align: center;
            min-width: 120px;
        }
        .color-box {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            margin: 0 auto 8px;
            border: 1px solid #ddd;
        }
        .color-name {
            font-weight: bold;
            margin-bottom: 4px;
        }
        .color-code {
            font-family: monospace;
            font-size: 10pt;
            color: #666;
        }
        .font-example {
            margin: 15px 0;
            padding: 15px;
            border-left: 4px solid ', assets$colors$primary, ';
            background: #f8f9fa;
        }
        .guidelines {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .guidelines ul {
            margin: 0;
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10pt;
            color: #666;
        }
        .logo-section {
            text-align: center;
            padding: 20px;
            background: ', assets$colors$primary, '10;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="brand-name">', assets$brandName, '</h1>
        <p class="subtitle">Brand Style Guide</p>
        <p class="subtitle">Version ', assets$version, ' • ', format(Sys.Date(), "%d %B %Y"), '</p>
    </div>

    <div class="section">
        <h2>O Marce</h2>
        <p><strong>Opis:</strong> ', assets$description, '</p>
        <p><strong>Branża:</strong> ', assets$industry, '</p>
        <p><strong>Grupa docelowa:</strong> ', assets$targetAudience, '</p>
    </div>

    <div class="section">
        <h2>Paleta Kolorów</h2>
        <div class="color-palette">
            <div class="color-item">
                <div class="color-box" style="background-color: ', assets$colors$primary, '"></div>
                <div class="color-name">Primary</div>
                <div class="color-code">', assets$colors$primary, '</div>
            </div>
            <div class="color-item">
                <div class="color-box" style="background-color: ', assets$colors$secondary, '"></div>
                <div class="color-name">Secondary</div>
                <div class="color-code">', assets$colors$secondary, '</div>
            </div>
            <div class="color-item">
                <div class="color-box" style="background-color: ', assets$colors$accent, '"></div>
                <div class="color-name">Accent</div>
                <div class="color-code">', assets$colors$accent, '</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Typografia</h2>
        <div class="font-example">
            <h3 style="font-family: ', assets$fonts$primary, ', sans-serif; margin: 0 0 10px 0;">
                Nagłówek - ', assets$fonts$primary, '
            </h3>
            <p style="font-family: ', assets$fonts$secondary, ', sans-serif; margin: 0;">
                Tekst podstawowy - ', assets$fonts$secondary, '. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Przykład zastosowania czcionki w tekście podstawowym dokumentu.
            </p>
        </div>
    </div>

    <div class="section">
        <h2>Logo i Identyfikacja</h2>
        <div class="logo-section">
            <p><strong>Format:</strong> SVG (skalowalne)</p>
            <p><strong>Styl:</strong> ', assets$logo$style, '</p>
            <p><strong>Dostępne warianty:</strong> ', paste(assets$logo$variants, collapse=", "), '</p>
        </div>
    </div>

    <div class="section">
        <h2>Ton i Komunikacja</h2>
        <div class="guidelines">
            <p><strong>Główne przesłanie:</strong> ', assets$brandGuidelines$messaging$mainMessage, '</p>
            <p><strong>Propozycja wartości:</strong> ', assets$brandGuidelines$messaging$valueProposition, '</p>
            <p><strong>Cechy komunikacji:</strong> ', paste(assets$brandGuidelines$voiceTone, collapse=", "), '</p>
        </div>
    </div>

    <div class="section">
        <h2>Zasady Użycia</h2>
        <h3>Logo</h3>
        <div class="guidelines">
            <ul>')
  
  # Add logo usage rules
  for (rule in assets$brandGuidelines$usageRules$logoUsage) {
    html_content <- paste0(html_content, '<li>', rule, '</li>')
  }
  
  html_content <- paste0(html_content, '
            </ul>
        </div>
        
        <h3>Kolory</h3>
        <div class="guidelines">
            <ul>')
  
  # Add color usage rules
  for (rule in assets$brandGuidelines$usageRules$colorUsage) {
    html_content <- paste0(html_content, '<li>', rule, '</li>')
  }
  
  html_content <- paste0(html_content, '
            </ul>
        </div>
        
        <h3>Typografia</h3>
        <div class="guidelines">
            <ul>')
  
  # Add typography rules
  for (rule in assets$brandGuidelines$usageRules$typography) {
    html_content <- paste0(html_content, '<li>', rule, '</li>')
  }
  
  html_content <- paste0(html_content, '
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>Aplikacje i Deployment</h2>
        <p><strong>Platformy:</strong> ', paste(assets$deployment$platforms, collapse=", "), '</p>
        <p><strong>Frameworki:</strong> ', paste(assets$deployment$frameworks, collapse=", "), '</p>
        <p><strong>Hosting:</strong> ', paste(assets$deployment$hosting, collapse=", "), '</p>
    </div>

    <div class="footer">
        <p>Style Guide wygenerowany przez PINnode System v1.0.0</p>
        <p>© ', format(Sys.Date(), "%Y"), ' ', assets$brandName, ' • Wszystkie prawa zastrzeżone</p>
    </div>
</body>
</html>')
  
  return(html_content)
}

# Generate HTML
cat("Creating HTML template...\\n")
html_content <- create_style_guide_html(assets)

# Write temporary HTML file
temp_html <- paste0(tools::file_path_sans_ext("${outputPath}"), ".html")
writeLines(html_content, temp_html)

# Convert HTML to PDF using pagedown
cat("Converting to PDF...\\n")
tryCatch({
  pagedown::chrome_print(
    input = temp_html,
    output = "${outputPath}",
    browser_args = c("--no-sandbox", "--disable-dev-shm-usage"),
    timeout = 30
  )
  
  cat("PDF generated successfully: ${outputPath}\\n")
  
  # Cleanup
  if (file.exists(temp_html)) {
    file.remove(temp_html)
  }
  
}, error = function(e) {
  cat("Error generating PDF:", e$message, "\\n")
  
  # Fallback: keep HTML file as backup
  cat("HTML file saved as fallback:", temp_html, "\\n")
})

cat("PDF generation completed.\\n")
`;
}

async function generateFallbackPDF(assetsData: any): Promise<Buffer> {
  // Fallback implementation using HTML template
  const htmlContent = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>${assetsData.brandName} - Style Guide</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid ${assetsData.colors.primary}; padding-bottom: 20px; }
        .brand-name { font-size: 2.5rem; color: ${assetsData.colors.primary}; margin: 0; }
        .section { margin: 30px 0; }
        .section h2 { color: ${assetsData.colors.primary}; border-bottom: 1px solid ${assetsData.colors.secondary}; padding-bottom: 10px; }
        .color-palette { display: flex; gap: 20px; flex-wrap: wrap; }
        .color-item { text-align: center; }
        .color-box { width: 80px; height: 80px; border-radius: 8px; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="brand-name">${assetsData.brandName}</h1>
        <p>Brand Style Guide - PDF Fallback</p>
    </div>
    <div class="section">
        <h2>Note</h2>
        <p>This is a fallback PDF placeholder. For full PDF generation, R/Shiny environment is required.</p>
        <p>Brand: ${assetsData.brandName}</p>
        <p>Industry: ${assetsData.industry}</p>
        <p>Primary Color: ${assetsData.colors.primary}</p>
    </div>
</body>
</html>`;
  
  return Buffer.from(htmlContent, 'utf-8');
}

export async function testShinyIntegration(): Promise<boolean> {
  try {
    // Test if R is available
    const { stdout } = await execAsync('R --version');
    return stdout.includes('R version');
  } catch (error) {
    console.log('R not available, using fallback PDF generation');
    return false;
  }
}