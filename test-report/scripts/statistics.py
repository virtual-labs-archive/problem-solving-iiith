import xlrd
import os
import sys
import re
import time
import texttable


filesinclude = set([".*testreport.org"])
filescombined = "(" + ")|(".join(filesinclude) + ")"

filesexclude = set([".*testreport.org~", ".*statsreport.org"])
filescombinedexcl = "(" + ")|(".join(filesexclude) + ")"

dirsexclude = set([".git", "IIT Bombay", "Amrita", "exp.*", "system"])
dirscombined = "(" + ")|(".join(dirsexclude) + ")"

def main(argv):
    if len(argv) < 2:
        print "Please provide the path of the file/directory within quotes in command line!"
    else:
        path = argv[1]
        if os.path.isfile(path):
            single_file(path)
        else:
            walk_over_path(path)

def single_file(path):
    basename = os.path.basename(path)
    basedir = os.path.dirname(path)
    name, extension = os.path.splitext(basename)
    if (re.match(".*_testreport.org", basename)):
        totalStatistics = {}
        statistics = getStatistics(path)
        labName = basename.rstrip("_testreport.org")
        totalStatistics[labName] = statistics
        statsPath = basedir + "/" + "stats.org"
        write_to_file(statsPath, totalStatistics)
    else:
        print "Program does not support the provided file format!"
    return

def walk_over_path(path):
    totalStatistics = {}
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if not re.match(dirscombined, d)]
        files[:] = [f for f in files if re.match(filescombined, f) and not re.match(filescombinedexcl, f)]
        for f in files:
            if (re.match(".*_testreport.org", f)):
                filePath = root + "/" + f
                statistics = getStatistics(filePath)
                labName = f.rstrip("_testreport.org")
                totalStatistics[labName] = statistics
    return

def getStatistics(path):
    statistics = {}

    filePointer = open(path, 'r')
    filePointer.readline()
    labNameLine = filePointer.readline()
    gitLabUrlLine = filePointer.readline()
    commitIdLine = filePointer.readline()
    filePointer.readline(); filePointer.readline(); filePointer.readline(); filePointer.readline()
    for line in filePointer.readlines():
        if re.match('--', line):
            continue
        splitData = line.split('|')
        splitData = [item.strip() for item in splitData]
        if (splitData[1] not in statistics):
            statistics[splitData[1]] = {}
            statistics[splitData[1]]['fail'] = 0
            statistics[splitData[1]]['pass'] = 0
        try:
            if(re.match('pass', splitData[3], re.IGNORECASE)):
                statistics[splitData[1]]['pass'] += 1
            elif(re.match('fail', splitData[3], re.IGNORECASE)):
                statistics[splitData[1]]['fail'] += 1
        except:
            if(re.match('pass', splitData[3], re.IGNORECASE)):
                statistics[splitData[1]] = {}
                statistics[splitData[1]]['pass'] = 1
                statistics[splitData[1]]['fail'] = 0
            elif(re.match('fail', splitData[3], re.IGNORECASE)):
                statistics[splitData[1]] = {}
                statistics[splitData[1]]['fail'] = 1
                statistics[splitData[1]]['pass'] = 0

    filePointer.close()
    dirname = os.path.dirname(path)
    commitId = commitIdLine.split(" ")[-1].strip("\n")
    labName = labNameLine.split(" ")[-1].strip("\n")
    exppath = dirname + "/" + labName + "_" + commitId + "_statsreport.org"
    write_to_file_per_lab(exppath, labNameLine, gitLabUrlLine, commitIdLine, statistics)
    return statistics

def write_to_file_per_lab(path, labNameLine, gitLabUrlLine, commitIdLine, data):
    filePointer = open(path, 'w')
    filePointer.write("* Statistics Report\n")
    filePointer.write(labNameLine)
    filePointer.write(gitLabUrlLine)
    filePointer.write(commitIdLine)
    filePointer.write("\n")
    tab = texttable.Texttable()
    tab.header(["S.no", "Experiment Name", "Pass Count", "Fail Count"])
    tab.set_cols_width([5,35,5,5])
    count = 1
    passcount = 0;    failcount = 0
    for exp in data:
        line = str(count) + ". \t" + exp + "\t\t"  +str(data[exp]['pass']) + "\t\t" + str(data[exp]['fail']) + "\n"
        tab.add_row([count, exp, data[exp]['pass'], data[exp]['fail']])
        passcount+=data[exp]['pass']
        failcount+=data[exp]['fail']
        count+=1

    filePointer.write("Total number of passed test cases = %s\n" %(passcount))
    filePointer.write("Total number of failed test cases = %s\n\n" %(failcount))
    filePointer.write(tab.draw())
    filePointer.close()
    return


if __name__ == "__main__":
    main(sys.argv)
