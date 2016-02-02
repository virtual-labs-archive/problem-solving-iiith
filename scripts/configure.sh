sed -i '/<\/VirtualHost>/i \
  <Directory /var/www/html> \
    AddHandler mod_python .py \
      PythonHandler mod_python.publisher \
        PythonDebug On \
        </Directory>
' /etc/apache2/sites-available/default.conf

