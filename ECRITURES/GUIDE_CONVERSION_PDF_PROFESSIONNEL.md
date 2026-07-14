# Guide de Conversion PDF Professionnel

**Auteur :** ASSOUMANOU Abdallah  
**Date :** 13 juillet 2026  
**Objectif :** Convertir les fichiers Markdown et Mermaid en PDF de qualité professionnelle

---

## Table des Matières

1. [Introduction](#1-introduction)
2. [Méthode 1 : Pandoc (Recommandée)](#2-méthode-1--pandoc-recommandée)
3. [Méthode 2 : VS Code avec Extension](#3-méthode-2--vs-code-avec-extension)
4. [Méthode 3 : Typst (Alternative Moderne)](#4-méthode-3--typst-alternative-moderne)
5. [Conversion des Schémas Mermaid](#5-conversion-des-schémas-mermaid)
6. [Templates Personnalisés](#6-templates-personnalisés)
7. [Automatisation](#7-automatisation)
8. [Dépannage](#8-dépannage)

---

## 1. Introduction

Ce guide explique comment convertir vos fichiers Markdown (contenant des schémas Mermaid) en PDF de qualité professionnelle pour votre présentation à votre encadrante de stage.

### Pourquoi éviter les convertisseurs en ligne ?

- **Qualité médiocre** : Rendu souvent pixelisé
- **Sécurité** : Données envoyées sur des serveurs tiers
- **Personnalisation limitée** : Pas de contrôle sur le style
- **Dépendance internet** : Nécessite une connexion
- **Fonctionnalités limitées** : Pas de support Mermaid avancé

### Solutions professionnelles recommandées

1. **Pandoc** : Outil de conversion document standard (recommandé)
2. **VS Code + Extension** : Solution locale simple
3. **Typst** : Alternative moderne et rapide

---

## 2. Méthode 1 : Pandoc (Recommandée)

Pandoc est l'outil de conversion de documents le plus puissant et le plus utilisé dans le monde académique et professionnel.

### 2.1 Installation

**Windows :**
```powershell
# Via Chocolatey
choco install pandoc

# Via Scoop
scoop install pandoc

# Manuel : Télécharger depuis https://pandoc.org/installing.html
```

**Vérification :**
```powershell
pandoc --version
```

### 2.2 Installation des dépendances

**Pour le support Mermaid :**
```powershell
# Installer Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Vérification
mmdc --version
```

**Pour les templates LaTeX (optionnel) :**
```powershell
# Installer MiKTeX (pour les templates LaTeX)
choco install miktex
```

### 2.3 Conversion basique

**Markdown → PDF :**
```powershell
pandoc input.md -o output.pdf
```

**Avec template :**
```powershell
pandoc input.md -o output.pdf --template=template.tex
```

### 2.4 Conversion avec Mermaid

**Étape 1 : Convertir Mermaid en images**
```powershell
# Convertir un fichier Mermaid en PNG
mmdc -i input.mmd -o output.png

# Convertir en SVG (vectoriel, meilleure qualité)
mmdc -i input.mmd -o output.svg

# Convertir en PDF
mmdc -i input.mmd -o output.pdf
```

**Étape 2 : Intégrer dans Markdown**
```markdown
# Mon Document

Voici mon schéma :

![Architecture](./output.png)

Suite du texte...
```

**Étape 3 : Convertir en PDF**
```powershell
pandoc input.md -o output.pdf
```

### 2.5 Script de conversion automatisé

Créer un fichier `convert.ps1` :

```powershell
# convert.ps1 - Script de conversion Markdown + Mermaid → PDF

param(
    [Parameter(Mandatory=$true)]
    [string]$inputFile,
    
    [Parameter(Mandatory=$false)]
    [string]$outputFile = ""
)

# Définir le fichier de sortie si non spécifié
if ($outputFile -eq "") {
    $outputFile = $inputFile -replace '\.md$', '.pdf'
}

# Créer un dossier temporaire
$tempDir = New-TemporaryDirectory

# Copier le fichier Markdown dans le dossier temporaire
$tempMd = Join-Path $tempDir (Split-Path $inputFile -Leaf)
Copy-Item $inputFile $tempMd

# Trouver et convertir tous les schémas Mermaid
$mermaidFiles = Get-ChildItem -Path $tempDir -Filter "*.mmd"
foreach ($file in $mermaidFiles) {
    $outputImage = $file.FullName -replace '\.mmd$', '.png'
    mmdc -i $file.FullName -o $outputImage
    
    # Remplacer la référence Mermaid dans le Markdown
    $mermaidRef = $file.Name
    $imageRef = $outputImage.Name
    (Get-Content $tempMd) -replace $mermaidRef, $imageRef | Set-Content $tempMd
}

# Convertir en PDF
pandoc $tempMd -o $outputFile --pdf-engine=xelatex -V mainfont="Arial"

# Nettoyer le dossier temporaire
Remove-Item $tempDir -Recurse -Force

Write-Host "Conversion terminée : $outputFile"
```

**Utilisation :**
```powershell
.\convert.ps1 -inputFile "ETAT_ART_PORTAILS_IA_ANALYTICS_GENERAL.md"
```

### 2.6 Template personnalisé

**Créer un template `custom.tex` :**
```latex
\documentclass{article}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{xcolor}

\geometry{
    a4paper,
    total={170mm,257mm},
    left=20mm,
    top=20mm,
}

\definecolor{primary}{RGB}{0,102,204}
\definecolor{secondary}{RGB}{51,51,51}

\hypersetup{
    colorlinks=true,
    linkcolor=primary,
    urlcolor=primary,
}

\setlength{\parindent}{0pt}
\setlength{\parskip}{6pt}

\begin{document}

$body$

\end{document}
```

**Utilisation :**
```powershell
pandoc input.md -o output.pdf --template=custom.tex
```

---

## 3. Méthode 2 : VS Code avec Extension

Solution simple pour une conversion rapide directement depuis VS Code.

### 3.1 Installation de l'extension

1. Ouvrir VS Code
2. Aller dans Extensions (Ctrl+Shift+X)
3. Rechercher "Markdown PDF"
4. Installer l'extension "Markdown PDF" de yzane

### 3.2 Configuration

**Ouvrir les settings (Ctrl+,) et ajouter :**
```json
{
    "markdown.pdf.format": "A4",
    "markdown.pdf.margin.top": "2cm",
    "markdown.pdf.margin.bottom": "2cm",
    "markdown.pdf.margin.right": "2cm",
    "markdown.pdf.margin.left": "2cm",
    "markdown.pdf.headerTemplate": "<div style='font-size: 10px; margin-left: 1cm;'>Saham Bank Analytics Portal - État de l'Art</div>",
    "markdown.pdf.footerTemplate": "<div style='font-size: 10px; text-align: center; width: 100%;'>Page {pageNum} of {totalPages}</div>",
    "markdown.pdf.displayHeaderFooter": true,
    "markdown.pdf.breaks": true
}
```

### 3.3 Conversion

**Méthode 1 : Via commande**
1. Ouvrir le fichier Markdown
2. Ctrl+Shift+P
3. Taper "Markdown PDF: Export (pdf)"
4. Choisir le fichier de sortie

**Méthode 2 : Via menu**
1. Clic droit sur le fichier Markdown
2. Choisir "Markdown PDF: Export (pdf)"

### 3.4 Support Mermaid

L'extension Markdown PDF ne supporte pas nativement Mermaid. Vous devez :

1. **Convertir Mermaid en images** (voir section 5)
2. **Intégrer les images** dans le Markdown
3. **Convertir en PDF**

---

## 4. Méthode 3 : Typst (Alternative Moderne)

Typst est une alternative moderne à LaTeX, plus simple et plus rapide.

### 4.1 Installation

**Windows :**
```powershell
# Via Scoop
scoop install typst

# Manuel : Télécharger depuis https://typst.app/docs/
```

**Vérification :**
```powershell
typst --version
```

### 4.2 Conversion basique

**Markdown → PDF :**
```powershell
typst compile input.md output.pdf
```

### 4.3 Conversion avec Mermaid

Typst ne supporte pas encore Mermaid nativement. Utilisez la méthode Pandoc.

---

## 5. Conversion des Schémas Mermaid

### 5.1 Méthode 1 : Mermaid CLI (Recommandée)

**Installation :**
```powershell
npm install -g @mermaid-js/mermaid-cli
```

**Conversion :**
```powershell
# PNG (raster)
mmdc -i input.mmd -o output.png

# SVG (vectoriel - recommandé pour PDF)
mmdc -i input.mmd -o output.svg

# PDF
mmdc -i input.mmd -o output.pdf

# Avec configuration personnalisée
mmdc -i input.mmd -o output.png -t neutral -b transparent
```

**Thèmes disponibles :**
- `default`
- `forest`
- `dark`
- `neutral`
- `base`

### 5.2 Méthode 2 : Mermaid Live Editor (Online)

1. Aller sur https://mermaid.live/
2. Coller le code Mermaid
3. Cliquer sur "Actions" → "Export SVG/PNG"
4. Télécharger l'image

**Note :** Utiliser cette méthode seulement si vous ne pouvez pas installer Mermaid CLI.

### 5.3 Méthode 3 : Intégration directe dans Markdown

Certains convertisseurs supportent Mermaid directement :

**Avec Pandoc + mermaid-filter :**
```powershell
# Installer le filtre
npm install -g mermaid-filter

# Convertir
pandoc input.md --filter mermaid-filter -o output.pdf
```

---

## 6. Templates Personnalisés

### 6.1 Template Pandoc avec en-tête professionnel

Créer `professional.tex` :
```latex
\documentclass[11pt,a4paper]{article}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{fancyhdr}
\usepackage{titling}

\geometry{
    a4paper,
    total={170mm,257mm},
    left=20mm,
    top=25mm,
    right=20mm,
    bottom=25mm,
}

\definecolor{sahamblue}{RGB}{0,51,102}
\definecolor{sahamgold}{RGB}{204,153,51}

\hypersetup{
    colorlinks=true,
    linkcolor=sahamblue,
    urlcolor=sahamblue,
    pdfauthor={ASSOUMANOU Abdallah},
    pdftitle={Saham Bank Analytics Portal},
}

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\textcolor{sahamblue}{\small Saham Bank Analytics Portal}}
\fancyhead[R]{\textcolor{sahamblue}{\small \today}}
\fancyfoot[C]{\textcolor{gray}{\small Page \thepage}}

\setlength{\parindent}{0pt}
\setlength{\parskip}{8pt}

\pretitle{\begin{center}\LARGE\bfseries\textcolor{sahamblue}}
\posttitle{\par\end{center}}

\begin{document}

$body$

\end{document}
```

**Utilisation :**
```powershell
pandoc input.md -o output.pdf --template=professional.tex
```

### 6.2 Configuration CSS pour VS Code

Créer `styles.css` :
```css
body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
    color: #003366;
    margin-top: 24px;
    margin-bottom: 16px;
}

h1 {
    border-bottom: 2px solid #CC9933;
    padding-bottom: 10px;
}

code {
    background-color: #f4f4f4;
    padding: 2px 4px;
    border-radius: 3px;
}

pre {
    background-color: #f4f4f4;
    padding: 16px;
    border-radius: 5px;
    overflow-x: auto;
}

img {
    max-width: 100%;
    height: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #003366;
    color: white;
}
```

---

## 7. Automatisation

### 7.1 Script PowerShell pour conversion batch

Créer `convert-all.ps1` :
```powershell
# convert-all.ps1 - Convertir tous les fichiers Markdown en PDF

$ecrituresDir = "ECRITURES"
$outputDir = "PDF_OUTPUT"

# Créer le dossier de sortie
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Convertir tous les fichiers Markdown
Get-ChildItem -Path $ecrituresDir -Filter "*.md" | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = Join-Path $outputDir ($_.BaseName + ".pdf")
    
    Write-Host "Conversion de $($_.Name)..."
    
    # Convertir les schémas Mermaid inclus
    $mermaidFiles = Get-ChildItem -Path $ecrituresDir -Filter "*.mmd"
    foreach ($mmd in $mermaidFiles) {
        $pngFile = $mmd.FullName -replace '\.mmd$', '.png'
        if (-not (Test-Path $pngFile)) {
            mmdc -i $mmd.FullName -o $pngFile
        }
    }
    
    # Convertir en PDF
    pandoc $inputFile -o $outputFile --template=professional.tex
    
    Write-Host "✓ $($_.Name) → $outputFile"
}

Write-Host "Conversion terminée !"
```

**Utilisation :**
```powershell
.\convert-all.ps1
```

### 7.2 Watch Mode (Conversion automatique)

Créer `watch-convert.ps1` :
```powershell
# watch-convert.ps1 - Surveiller les modifications et convertir automatiquement

$ecrituresDir = "ECRITURES"

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $ecrituresDir
$watcher.Filter = "*.md"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

$action = {
    $file = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    
    Write-Host "Modification détectée : $name"
    
    # Attendre que le fichier soit libéré
    Start-Sleep -Seconds 1
    
    # Convertir
    $outputFile = $file -replace '\.md$', '.pdf'
    pandoc $file -o $outputFile --template=professional.tex
    
    Write-Host "✓ Converti : $outputFile"
}

Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action

Write-Host "Surveillance activée. Appuyez sur Ctrl+C pour arrêter."
while ($true) { Start-Sleep -Seconds 5 }
```

**Utilisation :**
```powershell
.\watch-convert.ps1
```

---

## 8. Dépannage

### 8.1 Problèmes courants

**Problème : Pandoc non reconnu**
```powershell
# Solution : Ajouter Pandoc au PATH
# ou utiliser le chemin complet
C:\Program Files\Pandoc\pandoc.exe input.md -o output.pdf
```

**Problème : Mermaid CLI ne fonctionne pas**
```powershell
# Solution : Réinstaller Node.js et Mermaid CLI
npm uninstall -g @mermaid-js/mermaid-cli
npm install -g @mermaid-js/mermaid-cli
```

**Problème : Images non incluses dans le PDF**
```powershell
# Solution : Spécifier le chemin relatif correct
# ou utiliser --resource-path
pandoc input.md -o output.pdf --resource-path=ECRITURES
```

**Problème : Police non trouvée**
```powershell
# Solution : Installer la police ou utiliser une police système
pandoc input.md -o output.pdf -V mainfont="Arial"
```

### 8.2 Qualité d'image

**Pour améliorer la qualité des images :**
```powershell
# Utiliser SVG au lieu de PNG
mmdc -i input.mmd -o output.svg

# Augmenter la résolution PNG
mmdc -i input.mmd -o output.png -s 2
```

### 8.3 Performance

**Pour accélérer la conversion :**
```powershell
# Utiliser le cache Pandoc
pandoc input.md -o output.pdf --cache-dir=.pandoc-cache

# Désactiver les vérifications de sécurité (non recommandé)
pandoc input.md -o output.pdf --no-highlight
```

---

## 9. Résumé

### Méthode recommandée pour votre projet :

1. **Installer Pandoc** et **Mermaid CLI**
2. **Convertir les schémas Mermaid** en images PNG/SVG
3. **Utiliser le template professionnel** fourni
4. **Convertir les fichiers Markdown** en PDF avec Pandoc
5. **Utiliser le script automatisé** pour la conversion batch

### Commande rapide :

```powershell
# Conversion d'un fichier
pandoc ECRITURES\ETAT_ART_PORTAILS_IA_ANALYTICS_GENERAL.md -o PDF_OUTPUT\ETAT_ART_PORTAILS_IA_ANALYTICS_GENERAL.pdf --template=professional.tex

# Conversion de tous les fichiers
.\convert-all.ps1
```

### Résultat :

Vous obtiendrez des PDF professionnels de haute qualité, parfaits pour votre présentation à votre encadrante de stage.
