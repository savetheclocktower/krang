require 'rake'
require 'fileutils'

KRANG_ROOT     = File.expand_path(File.dirname(__FILE__))
KRANG_SRC_DIR  = File.join(KRANG_ROOT, 'src')
KRANG_DIST_DIR = File.join(KRANG_ROOT, 'dist')
KRANG_DOC_DIR  = File.join(KRANG_ROOT, 'doc')

$:.unshift File.join(KRANG_ROOT, 'vendor', 'sprockets', 'lib')

def sprocketize(path, source, destination = source)
  begin
    require 'sprockets'
  rescue
    puts "\nYou'll need Sprockets to build Krang. Just run:\n\n"
    puts "  $ git submodule init"
    puts "  $ git submodule update"
    puts "\nand you should be all set.\n\n"
  end
  
  root      = File.join(KRANG_ROOT,    path  )
  load_path = File.join(KRANG_SRC_DIR, source)
  
  secretary = Sprockets::Secretary.new(
    :root => root,
    :load_path => [load_path],
    :source_files => [source]
  )
  
  secretary.concatenation.save_to(File.join(KRANG_DIST_DIR, destination))
end


desc "Generates the distributable krang.js file."
task :dist do
  FileUtils.mkdir('dist') unless File.exists?('dist')  
  sprocketize('src', 'krang.js')
end