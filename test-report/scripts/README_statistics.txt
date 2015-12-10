# Title: Readme file for running statistics.py
# Author: Yogesh Agrawal
# Email: yogeshiiith@gmail.com; yogesh@vlabs.ac.in

1. Description::

This python script generates statistics report file in org format for each lab.

Format of the statistics report generated is as follows:
* Statistics Report
** Lab name:
** Github URL:
** Commit ID:

<Stats table>

Statistics report file for each lab is saved inside the lab folder.

2. Prerequisite::
a. Test report is already generated in org format for a lab.

b. Install dependencies:
   $ pip install texttable

3. Running the script::
Script can be executed as follows:

$ python statistics.py <absoulte path to lab folder where org files are present>

Example:
$ python statistics.py '/home/centos/QA-Legacy/IIIT Hyderabad/problem-solving-iiith'


