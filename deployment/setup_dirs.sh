#!/bin/bash
#Create necessary directories, links, etc.

#pass one argument using the --projectroot parameter.  This is the directory that
#represents the project root folder (which has src, assets, etc. folders)

pushd `dirname $0` > /dev/null
SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
popd > /dev/null
PROJECT_ROOT="${SCRIPT_PATH}/../"	

if [ ! -L "${PROJECT_ROOT}/../current" ]; then
	if [ -d "${PROJECT_ROOT}/../source" ]; then
		ln -s ${PROJECT_ROOT}/../source ${PROJECT_ROOT}/../current;
	fi
fi

# Typically, ${PROJECT_ROOT} => /var/www/imageprocessor/production (prod) or /var/www/imageprocessor/staging (stage)

#####################################################
#
# tmp directory
# --------------
#
# Typical mappings:
# /var/www/imageprocessor/production/tmp -> Production Server
# /var/www/imageprocessor/staging/tmp -> Staging server
#

mkdir ${PROJECT_ROOT}/../tmp; # temporary storage
mkdir ${PROJECT_ROOT}/../log;  # all application logs

ls