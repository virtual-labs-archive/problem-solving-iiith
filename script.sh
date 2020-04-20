#!/bin/bash

rsync -avz --progress build/* /var/www/html/Problem-Solving/
cd /var/www/html/Problem-Solving/
chmod 777 exp*/*

chmod 777 exp*
cd exp1/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp2/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp3/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp4/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp5/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp6/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp7/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp8/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp9/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../ && cd exp10/
chmod 777 *
cd Problem1/ && chmod o+w * && cd ../Problem2/ && chmod o+w *
cd ../../

