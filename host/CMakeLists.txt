cmake_minimum_required(VERSION 2.8)

PROJECT(sface)

if(WIN32)
  # nothing to do?
elseif(APPLE)
  include_directories(/usr/local/include/oscpack)
  include_directories(/usr/local/include/jsmn)
  link_directories(/usr/local/lib)
  set(CMAKE_CXX_FLAGS "-g -Wall")
  set(CMAKE_C_FLAGS "-g -Wall")
else()
  include_directories(/usr/include/oscpack)
  include_directories(/usr/include/jsmn)
  include_directories(/usr/local/include/jsmn)
  include_directories(/usr/local/include/oscpack)
  link_directories(/usr/local/lib)
  set(CMAKE_CXX_FLAGS "-g -Wall")
  set(CMAKE_C_FLAGS "-g -Wall")
endif()

add_executable(sface sface.cpp)
target_link_libraries(sface oscpack)
target_link_libraries(sface libjsmn.a)

INSTALL(TARGETS sface RUNTIME DESTINATION bin)