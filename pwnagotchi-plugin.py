import os
import logging
import requests
from datetime import datetime
from threading import Lock
from pwnagotchi.utils import StatusFile, remove_whitelisted
from pwnagotchi import plugins
from json.decoder import JSONDecodeError


class WpaSec(plugins.Plugin):
    __author__ = 'energydrinksjunkie'
    __version__ = '1.0.0'
    __license__ = 'GPL3'
    __description__ = 'This plugin automatically uploads handshakes to specified endpoint.'

    def __init__(self):
        self.ready = False
        self.lock = Lock()
        try:
            self.report = StatusFile('/root/.handshake_uploads', data_format='json')
        except JSONDecodeError:
            os.remove("/root/.handshake_uploads")
            self.report = StatusFile('/root/.handshake_uploads', data_format='json')
        self.options = dict()
        self.skip = list()

    def _upload_handshake(self, path, timeout=30):
        """
        Uploads the file to specified endpoint.
        """
        with open(path, 'rb') as file_to_upload:
            headers = { 'api_key': self.options['api_key'] }
            
            payload = {'pcap': file_to_upload}

            api_url = self.options['api_url']
            if not api_url.endswith('/'):
                api_url = f"{api_url}/"
            api_url = f"{api_url}handshake/"

            try:
                result = requests.post(api_url,
                                       headers=headers,
                                       files=payload,
                                       timeout=timeout)
                if ' already submitted' in result.text:
                    logging.debug("%s was already submitted.", path)
            except requests.exceptions.RequestException as req_e:
                raise req_e


    def _download_handshake(self, output, timeout=30):
        """
        Downloads the results from specified endpoint and safes them to output
        """
        api_url = self.options['api_url']
        if not api_url.endswith('/'):
            api_url = f"{api_url}/"
        api_url = f"{api_url}handshake/"

        headers = {'api_key': self.options['api_key']}
        try:
            result = requests.get(api_url, headers=headers, timeout=timeout)
            with open(output, 'wb') as output_file:
                output_file.write(result.content)
        except requests.exceptions.RequestException as req_e:
            raise req_e
        except OSError as os_e:
            raise os_e


    def on_loaded(self):
        """
        Gets called when the plugin gets loaded
        """
        if 'api_key' not in self.options or ('api_key' in self.options and not self.options['api_key']):
            logging.error(f"HANDSHAKE_UPLOAD: API-KEY isn't set. Can't upload to {self.options['api_url']}")
            return

        if 'api_url' not in self.options or ('api_url' in self.options and not self.options['api_url']):
            logging.error("HANDSHAKE_UPLOAD: API-URL isn't set. Can't upload, no endpoint configured.")
            return

        if 'whitelist' not in self.options:
            self.options['whitelist'] = list()

        self.ready = True
        logging.info("HANDSHAKE_UPLOAD: plugin loaded")

    def on_internet_available(self, agent):
        """
        Called in manual mode when there's internet connectivity
        """
        if not self.ready or self.lock.locked():
            return

        with self.lock:
            config = agent.config()
            display = agent.view()
            reported = self.report.data_field_or('reported', default=list())
            handshake_dir = config['bettercap']['handshakes']
            handshake_filenames = os.listdir(handshake_dir)
            handshake_paths = [os.path.join(handshake_dir, filename) for filename in handshake_filenames if
                               filename.endswith('.pcap')]
            handshake_paths = remove_whitelisted(handshake_paths, self.options['whitelist'])
            handshake_new = set(handshake_paths) - set(reported) - set(self.skip)

            if handshake_new:
                logging.info(f"HANDSHAKE_UPLOAD: Internet connectivity detected. Uploading new handshakes to {self.options['api_url']}")
                for idx, handshake in enumerate(handshake_new):
                    display.on_uploading(f"{self.options['api_url']} ({idx + 1}/{len(handshake_new)})")

                    try:
                        self._upload_handshake(handshake)
                        reported.append(handshake)
                        self.report.update(data={'reported': reported})
                        logging.debug("HANDSHAKE_UPLOAD: Successfully uploaded %s", handshake)
                    except requests.exceptions.RequestException as req_e:
                        self.skip.append(handshake)
                        logging.debug("HANDSHAKE_UPLOAD: %s", req_e)
                        continue
                    except OSError as os_e:
                        logging.debug("HANDSHAKE_UPLOAD: %s", os_e)
                        continue

                display.on_normal()

            if 'download_results' in self.options and self.options['download_results']:
                cracked_file = os.path.join(handshake_dir, 'cracked_passwords.txt')
                if os.path.exists(cracked_file):
                    last_check = datetime.fromtimestamp(os.path.getmtime(cracked_file))
                    if last_check is not None and ((datetime.now() - last_check).seconds / (60 * 60)) < 1:
                        return
                try:
                    self._download_handshake(os.path.join(handshake_dir, 'cracked_passwords.txt'))
                    logging.info("HANDSHAKE_UPLOAD: Downloaded cracked passwords.")
                except requests.exceptions.RequestException as req_e:
                    logging.debug("HANDSHAKE_UPLOAD: %s", req_e)
                except OSError as os_e:
                    logging.debug("HANDSHAKE_UPLOAD: %s", os_e)
