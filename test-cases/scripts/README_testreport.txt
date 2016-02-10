# Title: Readme file for running testreport.py
# Author: Yogesh Agrawal
# Email: yogeshiiith@gmail.com; yogesh@vlabs.ac.in

1. Description::

This python script generates meta file in org format for each experiment and test report file in org format for each lab.

Format of the meta report generated is as follows:
<S.no> <Test Case Link to github>
1. <link1>
2. <link2>

Format of the test report generated is as follows:
* Test Report
** Lab name:
** Github URL:
** Commit ID:

<test report table>


Meta file for each experiment is saved inside the experiment folder.
Test report file for each lab is saved inside the lab folder.

2. Prerequisite::
a. Test cases for each lab are already generated in org format.


3. Running the script::
Script can be executed as follows:

$ python testreport.py <absoulte path to lab folder where org files are present>

Example:
$ python testreport.py '/home/centos/QA-Legacy/IIIT Hyderabad/problem-solving-iiith'


